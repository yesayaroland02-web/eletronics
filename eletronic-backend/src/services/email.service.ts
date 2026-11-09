import fs from "fs";
import path from "path";
import handlebars, { templates } from "handlebars";
import { transporter } from "../config/mailer.js";
import dotenv from "dotenv";

dotenv.config();

interface SendNewProductNotification {
  to: string;
  productTitle: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export async function sendNewProductNotification({
  to,
  productTitle,
  category,
  price,
  stock,
  imageUrl,
}: SendNewProductNotification) {
  // format harga ke rupiah
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(price);

  // path ke file template hbs
  const filePath = path.resolve("src/templates/email/new-product.hbs");
  const templateSource = fs.readFileSync(filePath, "utf-8");

  // compile template dengan Handlebars
  const compiledTemplate = handlebars.compile(templateSource);
  const htmlToSend = compiledTemplate({
    productTitle,
    category,
    price: formattedPrice,
    stock,
    imageUrl,
  });

  const info = await transporter.sendMail({
    from: `"Store System" - <${process.env.EMAIL_USER}>`,
    to,
    subject: `[Admin Alert] - Produk Baru: ${productTitle}`,
    html: htmlToSend,
  });

  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);
  console.log("response:", info.response);
}

export async function lowStockNotification(
  products: any[],
  adminEmail: string,
) {
  // path ke file template hbs
  const filePath = path.resolve("src/templates/email/low-stock.hbs");
  const templateSource = fs.readFileSync(filePath, "utf-8");

  // compile template dengan Handlebars
  const compiledTemplate = handlebars.compile(templateSource);
  const htmlToSend = compiledTemplate({
    products,
  });

  const info = await transporter.sendMail({
    from: `"Store System" - <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[Admin Alert] - Stock Menipis!`,
    html: htmlToSend,
  });

  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);
  console.log("response:", info.response);
}