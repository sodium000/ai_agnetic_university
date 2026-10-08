import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(
    /^(\+?8801|01)[3-9]\d{8}$|^(\+[1-9]\d{1,14})$/,
    "Please enter a valid phone number (e.g., 018XXXXXXXX or +8801XXXXXXXX)",
  );

export const dateOfBirthSchema = z
  .string()
  .trim()
  .min(1, "Date of birth is required")
  .refine(
    (val) => {
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      return date < now;
    },
    { message: "Date of birth must be a valid past date" },
  );

export const genderSchema = z.enum(["Male", "Female", "Other"], {
  message: "Please select Male, Female, or Other",
});

export const addressSchema = z
  .string()
  .trim()
  .min(3, "Address must be at least 3 characters")
  .max(250, "Address cannot exceed 250 characters");

export const photoUrlSchema = z.string().trim().min(1, "Photo is required");
