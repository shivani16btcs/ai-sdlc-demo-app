
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InvoiceRepository } from "./repositories/invoiceRepository.js";
import { ApprovalService } from "./services/approvalService.js";
import { createInvoiceRouter } from "./controllers/invoiceController.js";
import authRouter from "./controllers/authController.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const publicPath = path.resolve(currentDir, "../public");

  console.log("Serving static files from:", publicPath);

  app.use(express.static(publicPath));

  app.use("/api/auth", authRouter);

  const repository = new InvoiceRepository();
  const approvalService = new ApprovalService(repository);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
  });

  app.use(
    "/api/invoices",
    createInvoiceRouter(repository, approvalService)
  );

  return app;
}
