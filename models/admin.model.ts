import { ObjectId } from "mongodb";
import { z } from "zod";

export const adminSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export const adminResponseSchema = z.object({
    _id: z.instanceof(ObjectId),
    username: z.string(),
    token: z.string(),
})

export type AdminRequest = z.infer<typeof adminSchema>;
export type AdminResponse = z.infer<typeof adminResponseSchema>;