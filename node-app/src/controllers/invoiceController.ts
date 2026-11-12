import { Router } from "express";
import { randomUUID } from "node:crypto";
import { InvoiceRepository } from "../repositories/invoiceRepository.js";
import { ApprovalService } from "../services/approvalService.js";
import type { Invoice } from "../models/invoice.js";
import {
  authenticate,
  type AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

export function createInvoiceRouter(
  repository: InvoiceRepository,
  approvalService: ApprovalService,
): Router {
  const router = Router();

  router.post("/", (req, res) => {
    const { amount } = req.body;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invoice amount must be a positive number.",
      });
    }

    const invoice: Invoice = {
      id: randomUUID(),
      amount,
      status: "PENDING",
      approvals: [],
    };

    repository.create(invoice);
    return res.status(201).json(invoice);
  });

  router.get("/", (_req, res) => {
    return res.json(repository.findAll());
  });

  router.get("/:id", (req, res) => {
    const invoice = repository.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    return res.json(invoice);
  });

  // Authentication is required for approval.
  router.post("/:id/approve", authenticate, (req, res) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    try {
      const invoiceId = req.params.id;

      if (typeof invoiceId !== "string") {
        return res.status(400).json({ message: "Invalid invoice ID." });
      }

      const invoice = approvalService.approve(invoiceId, user);
      return res.json(invoice);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Approval failed.";

      const statusCode = message === "Invoice not found." ? 404 : 400;

      return res.status(statusCode).json({ message });
    }
  });

  return router;
}
