
import { z } from "zod";

export const createCheckoutSchema = z.object({
  body: z.object({
    checkIn: z.iso.date({
      error: "Tanggal check-in tidak valid",
    }),

    checkOut: z.iso.date({
      error: "Tanggal check-out tidak valid",
    }),

    items: z
      .array(
        z.object({
          productId: z.string().uuid({
            error: "Product ID tidak valid",
          }),

          quantity: z
            .number()
            .int("Jumlah kamar harus berupa bilangan bulat")
            .min(1, "Minimal memesan 1 kamar"),
        })
      )
      .min(1, "Minimal harus memilih satu kamar"),
  }),
});

export const uploadPaymentProofSchema = z.object({
  params: z.object({
    orderId: z.string().uuid({
      error: "Order ID tidak valid",
    }),
  }),
});

export const verifyCheckoutSchema = z.object({
  params: z.object({
    orderId: z.string().uuid({
      error: "Order ID tidak valid",
    }),
  }),

  body: z.object({
    status: z.enum(["PAID", "CANCELLED"], {
      error: "Status harus PAID atau CANCELLED",
    }),
  }),
});

export type CreateCheckoutInput = z.infer<
  typeof createCheckoutSchema
>["body"];

export type UploadPaymentProofInput = z.infer<
  typeof uploadPaymentProofSchema
>["params"];

export type VerifyCheckoutInput = z.infer<
  typeof verifyCheckoutSchema
>["body"];