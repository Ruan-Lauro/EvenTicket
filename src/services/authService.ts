import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository.ts";
import { AppError } from "../errors/appError.ts";

const userRepository = new UserRepository();

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
  ) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email já cadastrado", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      name,
      email,
      passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}