import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// kita akan membuat fungsi validate
// berguna untuk menerima skema zod sebagai parameter, lalu mengembalikan fungsi middleware Express

export const validate =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync akan mengecek req.body, req.params, dan req.query berdasarkan skema Zod
      const parsed = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      })) as any;

      // menimpa nilai req dengan data yang sudah tervalidasi dan dibersihkan oleh Zod
      req.body = parsed.body ?? req.body;

      // lanjut ke controller/middleware berikutnya
      return next();
    } catch (error) {
      // jika error terjadi akibat gagal validasi zod
      if (error instanceof ZodError) {
        return res.status(400).send({
          status: "failed",
          message: "Validasi data gagal",
          // mengubah format error zod menjadi array object yang rapi
          errors: error.issues.map((issue) => ({
            field: issue.path.join(), // menyebutkan lokasi field yang error (misal: "body.price")
            message: issue.message, // pesan error yang ditampilkan ke pengguna
          })),
        });
      }

      // jika ada error internal lain, oper ke global error handler
      return next(error);
    }
  };