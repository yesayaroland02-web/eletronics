import { Request, Response } from "express";

export async function handleStockNotification(
  req: Request,
  res: Response
) {
  res.status(200).send({
    message: "Stock notification queue worker received",
  });
}