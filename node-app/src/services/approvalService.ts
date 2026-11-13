import type { Invoice, InvoiceStatus } from "../models/invoice.js";
import type { User } from "../models/user.js";
import { InvoiceRepository } from "../repositories/invoiceRepository.js";

export class ApprovalService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  approve(invoiceId: string, user: User): Invoice {
    const invoice = this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    if (invoice.status !== "PENDING") {
      throw new Error("Only pending invoices can be approved.");
    }

    if (invoice.approvals.some((approval) => approval.approverId === user.id)) {
      throw new Error("The same user cannot approve an invoice twice.");
    }

    // Invoices up to 50,000: Manager or Director can approve.
    if (invoice.amount <= 50000) {
      return this.recordApproval(invoice, user, "APPROVED");
    }

    // Invoices above 50,000 and up to 500,000: Director required.
    if (invoice.amount <= 500000) {
      if (user.role !== "DIRECTOR") {
        throw new Error("You are not authorized to approve this invoice.");
      }

      return this.recordApproval(invoice, user, "APPROVED");
    }

    // Invoices above 500,000 require two distinct approvers.
    if (invoice.approvals.length >= 2) {
      throw new Error("Invoice has already received the required approvals.");
    }

    if (invoice.approvals.length === 0) {
      return this.recordApproval(invoice, user, "PENDING");
    }

    // The second approver must be a Director.
    if (user.role !== "DIRECTOR") {
      throw new Error("The second approver must be a Director.");
    }

    return this.recordApproval(invoice, user, "APPROVED");
  }

  private recordApproval(
    invoice: Invoice,
    user: User,
    status: InvoiceStatus,
  ): Invoice {
    const updatedInvoice: Invoice = {
      ...invoice,
      approvals: [
        ...invoice.approvals,
        {
          approverId: user.id,
          approverName: user.name,
          approverRole: user.role,
          approvedAt: new Date(),
        },
      ],
      status,
    };

    return this.invoiceRepository.update(updatedInvoice);
  }
}
