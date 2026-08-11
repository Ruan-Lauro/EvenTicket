import { z } from "zod";

export const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().min(2).max(100),
    role: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

