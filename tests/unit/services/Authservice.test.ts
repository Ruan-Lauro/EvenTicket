import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../src/services/authService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IUserRepository } from "../../../src/interfaces/userRepositoryInterface.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

const makeUser = (overrides = {}) => ({
  id: 1,
  name: "João Silva",
  email: "joao@email.com",
  passwordHash: "hashed_password",
  role: "USER" as const,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUserRepo = (): IUserRepository => ({
  findByEmail: vi.fn(),
  getUsers: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  createWithRole: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe("AuthService", () => {
  let userRepo: IUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = makeUserRepo();
    authService = new AuthService(userRepo);
    process.env.JWT_ACCESS_SECRET = "test_secret";
  });


  describe("register", () => {
    it("deve criar e retornar o usuário sem o passwordHash quando o e-mail não existe", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_pw" as never);
      const created = makeUser({ name: "Ana", email: "ana@email.com" });
      vi.mocked(userRepo.create).mockResolvedValue(created);

      const result = await authService.register("Ana", "ana@email.com", "senha123");

      expect(userRepo.findByEmail).toHaveBeenCalledWith("ana@email.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 12);
      expect(userRepo.create).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@email.com",
        passwordHash: "hashed_pw",
      });
      expect(result).toEqual({
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      });
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve lançar AppError 409 quando o e-mail já está cadastrado", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(makeUser());

      await expect(
        authService.register("João", "joao@email.com", "senha"),
      ).rejects.toThrow(new AppError("Email já cadastrado", 409));

      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it("deve fazer hash da senha com custo 12", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      vi.mocked(userRepo.create).mockResolvedValue(makeUser());

      await authService.register("X", "x@x.com", "minha_senha");

      expect(bcrypt.hash).toHaveBeenCalledWith("minha_senha", 12);
    });
  });


  describe("login", () => {
    it("deve retornar token e dados do usuário em um login válido", async () => {
      const user = makeUser();
      vi.mocked(userRepo.findByEmail).mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("jwt_token" as never);

      const result = await authService.login("joao@email.com", "senha123");

      expect(result.token).toBe("jwt_token");
      expect(result.user).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    });

    it("deve assinar o JWT com sub = userId e role corretos", async () => {
      const user = makeUser({ id: 42, role: "ADMIN" });
      vi.mocked(userRepo.findByEmail).mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("tok" as never);

      await authService.login("joao@email.com", "senha");

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 42, role: "ADMIN" },
        "test_secret",
        { expiresIn: "15m" },
      );
    });

    it("deve lançar AppError 401 quando o usuário não existe", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

      await expect(authService.login("nao@existe.com", "senha")).rejects.toThrow(
        new AppError("Email ou senha inválidos", 401),
      );
    });

    it("deve lançar AppError 401 quando a senha está incorreta", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(makeUser());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login("joao@email.com", "errada")).rejects.toThrow(
        new AppError("Email ou senha inválidos", 401),
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("me", () => {
    it("deve retornar os dados do usuário autenticado quando ele existe", async () => {
      const user = makeUser({ id: 7, name: "Maria Souza" });
      vi.mocked(userRepo.findById).mockResolvedValue(user);

      const result = await authService.me(7);

      expect(userRepo.findById).toHaveBeenCalledWith(7);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve lançar AppError 404 quando o usuário autenticado não existe", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(authService.me(999)).rejects.toThrow(
        new AppError("Usuário não encontrado", 404),
      );
    });
  });
});