import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{6,20}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  role: z.enum(["USER", "PROVIDER"], {
    errorMap: () => ({ message: "Select an account type" }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const priceField = z.coerce
  .number({ invalid_type_error: "Price must be a number" })
  .positive("Price must be greater than 0");

const quantityField = z.coerce
  .number({ invalid_type_error: "Quantity must be a number" })
  .int("Quantity must be a whole number")
  .min(0, "Quantity cannot be negative");

export const mealCreateSchema = z.object({
  name: z.string().trim().min(2, "Meal name must be at least 2 characters"),
  categoryId: z.string().trim().min(1, "Select a category"),
  price: priceField,
  quantity: quantityField,
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
});
export type MealCreateInput = z.infer<typeof mealCreateSchema>;

export const mealUpdateSchema = z.object({
  name: z.string().trim().min(2, "Meal name must be at least 2 characters"),
  price: priceField,
  quantity: quantityField,
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"], {
    errorMap: () => ({ message: "Select a status" }),
  }),
});
export type MealUpdateInput = z.infer<typeof mealUpdateSchema>;

export const checkoutSchema = z.object({
  address: z
    .string()
    .trim()
    .min(5, "Delivery address must be at least 5 characters"),
  contactNumber: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid contact number"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  ratings: z.coerce
    .number({ invalid_type_error: "Select a rating" })
    .int("Select a rating")
    .min(1, "Select a rating between 1 and 5")
    .max(5, "Select a rating between 1 and 5"),
  comment: z.string().trim().min(3, "Comment must be at least 3 characters"),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const providerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});
export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;

/** Flattens a ZodError into a `{ field: firstMessage }` record. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
