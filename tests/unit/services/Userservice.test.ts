import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../../../src/services/userService.ts";
import { AppError } from "../../../src/errors/appError.ts";
import type { IUserRepository } from "../../../src/interfaces/userRepositoryInterface.ts";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs");

const makeUser = (overrides = {}) => ({
  id: 1,
  name: "João Silva",
  email: "joao@email.com",
  passwordHash: "hashed_pw",
  role: "USER" as const,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUserGet = (overrides = {}) => ({
  id: 1,
  name: "João Silva",
  email: "joao@email.com",
  role: "USER" as const,
  emailVerified: false,
  createdAt: new Date(),
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

describe("UserService", () => {
  let userRepo: IUserRepository;
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = makeUserRepo();
    userService = new UserService(userRepo);
  });

  describe("getUsers", () => {
    it("deve retornar a lista de usuários do repositório", async () => {
      const users = [makeUserGet(), makeUserGet({ id: 2 })];
      vi.mocked(userRepo.getUsers).mockResolvedValue(users);

      const result = await userService.getUsers();

      expect(userRepo.getUsers).toHaveBeenCalledOnce();
      expect(result).toEqual(users);
    });

    it("deve retornar lista vazia quando não há usuários", async () => {
      vi.mocked(userRepo.getUsers).mockResolvedValue([]);

      const result = await userService.getUsers();

      expect(result).toHaveLength(0);
    });
  });

  describe("getUserById", () => {
    it("deve retornar o usuário quando encontrado", async () => {
      const user = makeUserGet();
      vi.mocked(userRepo.findById).mockResolvedValue(user);

      const result = await userService.getUserById(1);

      expect(userRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it("deve lançar AppError 404 quando o usuário não existe", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(userService.getUserById(99)).rejects.toThrow(
        new AppError("Usuário não encontrado", 404),
      );
    });
  });

  describe("updateUser", () => {
    it("deve atualizar e retornar dados públicos do usuário", async () => {
      const existing = makeUserGet();
      const updated = makeUser({ name: "Novo Nome" });
      vi.mocked(userRepo.findById).mockResolvedValue(existing);
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepo.update).mockResolvedValue(updated);

      const result = await userService.updateUser(1, { name: "Novo Nome" });

      expect(result).toEqual({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      });
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve fazer hash da senha quando passwordHash é fornecido", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(makeUserGet());
      vi.mocked(bcrypt.hash).mockResolvedValue("novo_hash" as never);
      vi.mocked(userRepo.update).mockResolvedValue(makeUser());

      await userService.updateUser(1, { passwordHash: "nova_senha" });

      expect(bcrypt.hash).toHaveBeenCalledWith("nova_senha", 12);
      expect(userRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ passwordHash: "novo_hash" }),
      );
    });

    it("não deve fazer hash quando passwordHash não é fornecido", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(makeUserGet());
      vi.mocked(userRepo.update).mockResolvedValue(makeUser());

      await userService.updateUser(1, { name: "Só nome" });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("deve lançar AppError 404 quando o usuário não existe", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(
        userService.updateUser(99, { name: "X" }),
      ).rejects.toThrow(new AppError("Usuário não encontrado", 404));
    });

    it("deve lançar AppError 400 quando o e-mail já pertence a outro usuário", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(makeUserGet());
      vi.mocked(userRepo.findByEmail).mockResolvedValue(makeUser({ id: 2 }));

      await expect(
        userService.updateUser(1, { email: "outro@email.com" }),
      ).rejects.toThrow(new AppError("Email já cadastrado", 400));

      expect(userRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("createUserWithRole", () => {
    it("deve criar usuário com role personalizado", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash_admin" as never);
      const created = makeUser({ role: "ADMIN" });
      vi.mocked(userRepo.createWithRole).mockResolvedValue(created);

      const result = await userService.createUserWithRole({
        name: "Admin",
        email: "admin@email.com",
        passwordHash: "senha",
        role: "ADMIN",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("senha", 12);
      expect(userRepo.createWithRole).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: "hash_admin", role: "ADMIN" }),
      );
      expect(result).toEqual({
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      });
    });

    it("deve lançar AppError 400 quando o e-mail já existe", async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(makeUser());

      await expect(
        userService.createUserWithRole({
          name: "X",
          email: "joao@email.com",
          passwordHash: "pw",
          role: "USER",
        }),
      ).rejects.toThrow(new AppError("Email já cadastrado", 400));

      expect(userRepo.createWithRole).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("deve chamar delete no repositório quando o usuário existe", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(makeUserGet());
      vi.mocked(userRepo.delete).mockResolvedValue();

      await userService.deleteUser(1);

      expect(userRepo.delete).toHaveBeenCalledWith(1);
    });

    it("deve lançar Error quando o usuário não existe", async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(userService.deleteUser(99)).rejects.toThrow(
        "Usuário não encontrado",
      );
    });
  });
});