
import { beforeEach, describe, expect, it } from "vitest";
import { ApprovalService } from "../src/services/approvalService.js";
import { InvoiceRepository } from "../src/repositories/invoiceRepository.js";
import type { Invoice } from "../src/models/invoice.js";
import type { User } from "../src/models/user.js";

describe("ApprovalService", () => {
  let repository: InvoiceRepository;
  let service: ApprovalService;

  const manager: User = {
    id: "manager-1",
    name: "Manager One",
    role: "MANAGER"
  };

  const director: User = {
    id: "director-1",
    name: "Director One",
    role: "DIRECTOR"
  };

  const secondDirector: User = {
    id: "director-2",
    name: "Director Two",
    role: "DIRECTOR"
  };

  beforeEach(() => {
    repository = new InvoiceRepository();
    service = new ApprovalService(repository);
  });

  function createInvoice(amount: number): Invoice {
    const invoice: Invoice = {
      id: "INV-001",
      amount,
      status: "PENDING",
      approvals: []
    };

    repository.create(invoice);
    return invoice;
  }

  it("allows a Manager to approve an invoice of 50,000", () => {
    createInvoice(50000);

    const result = service.approve("INV-001", manager);

    expect(result.status).toBe("APPROVED");
    expect(result.approvals).toHaveLength(1);
  });

  it("rejects a Manager approving an invoice above 50,000", () => {
    createInvoice(50001);

    expect(() => service.approve("INV-001", manager))
      .toThrow("You are not authorized to approve this invoice.");
  });

  it("allows a Director to approve an invoice of 500,000", () => {
    createInvoice(500000);

    const result = service.approve("INV-001", director);

    expect(result.status).toBe("APPROVED");
  });

  it("keeps an invoice pending after the first approval above 500,000", () => {
    createInvoice(500001);

    const result = service.approve("INV-001", manager);

    expect(result.status).toBe("PENDING");
    expect(result.approvals).toHaveLength(1);
  });

  it("approves an invoice above 500,000 after a second distinct Director approves", () => {
    createInvoice(500001);

    service.approve("INV-001", manager);
    const result = service.approve("INV-001", secondDirector);

    expect(result.status).toBe("APPROVED");
    expect(result.approvals).toHaveLength(2);
  });

  it("rejects the same user approving twice", () => {
    createInvoice(500001);

    service.approve("INV-001", director);

    expect(() => service.approve("INV-001", director))
      .toThrow("The same user cannot approve an invoice twice.");
  });

  it("rejects a Manager as the second approver above 500,000", () => {
    createInvoice(500001);

    service.approve("INV-001", director);

    expect(() => service.approve("INV-001", manager))
      .toThrow("The second approver must be a Director.");
  });

  it("does not modify invoice data after a rejected approval", () => {
    const original = createInvoice(50001);
    const originalSnapshot = structuredClone(original);

    expect(() => service.approve("INV-001", manager))
      .toThrow();

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it("rejects approval when the invoice does not exist", () => {
    expect(() => service.approve("UNKNOWN", manager))
      .toThrow("Invoice not found.");
  });

  it("rejects approval when the invoice is not pending", () => {
    const invoice = createInvoice(50000);
    invoice.status = "APPROVED";

    expect(() => service.approve("INV-001", manager))
      .toThrow("Only pending invoices can be approved.");
  });
});

