import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
 
  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),
 
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
});
 
export const loginSchema = z.object({
  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),
 
  password: z.string(),
});

export const createUserWithRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
 
  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),
 
  passwordHash: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
  role: z.enum(["USER", "ADMIN", "ORGANIZER", "CONCIERGE"]),
});

export const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().min(2).max(100),
    role: z.string().optional(),
    emailVerified: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userSchemaUpdate = z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).max(100).optional(),
    role: z.string().optional(),
    emailVerified: z.boolean().optional(),
});

export const publicationSchema = z.object({
    externalEventId: z.string().max(100),
    name: z.string().max(200),
    description: z.string().max(500).optional(),
    local: z.string().max(200),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Data inválida",
    }),
    price: z
        .number()
        .nonnegative()
        .refine((n) => Number.isFinite(n) && Math.round(n * 100) === n * 100, {
            message: "Price must have at most 2 decimal places",
        }),
    capacity: z.number().int().nonnegative(),
    type: z.string().max(100),
    image: z.string().max(200),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
    userId: z.number().int().nonnegative(),
})