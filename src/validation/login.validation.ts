import z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    "Password must include upper, lower, number, and special character",
  );

  export const loginShema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginShema>