import { ObjectId } from "mongodb";
import { z } from "zod";

export const userSchema = z.object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    accountNumber: z.number({
        required_error: "Account number is required",
    }),
    emailAddress: z.string().email("Invalid email address"),
    // i assume identity number is an Indonesia ktp string standard format so, i think it should be 15 characters 
    identityNumber: z.string().min(15, "Identity number must be at least 10 characters"),
})

export const UserResponseSchema = z.object({
    _id: z.instanceof(ObjectId),
    userName: z.string(),
    emailAddress: z.string(),
    accountNumber: z.number(),
})

export type UserRequest = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;  