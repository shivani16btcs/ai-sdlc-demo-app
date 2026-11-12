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
    role: "MANAGER",
  };

  const director: User = {
    id: "director-1",
    name: "Director One",
    role: "DIRECTOR",
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
      approvals: [],
    };

    repository.create(invoice);
    return invoice;
  }

  function expectSingleApproval(invoice: Invoice, user: User): void {
    expect(invoice.status).toBe("APPROVED");
    expect(invoice.approvals).toHaveLength(1);
    expect(invoice.approvals[0]).toMatchObject({
      approverId: user.id,
      approverName: user.name,
      approverRole: user.role,
    });
    expect(invoice.approvals[0].approvedAt).toBeInstanceOf(Date);
  }

  it("allows a Manager to approve 50,000", () => {
    createInvoice(50000);

    expectSingleApproval(service.approve("INV-001", manager), manager);
  });

  it("rejects a Manager at 50,001 without changing the invoice", () => {
    const invoice = createInvoice(50001);
    const originalSnapshot = structuredClone(invoice);

    expect(() => service.approve("INV-001", manager)).toThrow(
      "You are not authorized to approve this invoice.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it.each([50001, 500000])(
    "allows a Director to approve %i with one approval",
    (amount) => {
      createInvoice(amount);

      expectSingleApproval(service.approve("INV-001", director), director);
    },
  );

  it.each([manager, director])(
    "allows $name to approve a 500,001 invoice with one approval",
    (approver) => {
      createInvoice(500001);

      expectSingleApproval(service.approve("INV-001", approver), approver);
    },
  );

  it("rejects approval of an already approved invoice without changing it", () => {
    const invoice = createInvoice(50000);
    service.approve("INV-001", manager);
    const originalSnapshot = structuredClone(repository.findById("INV-001"));

    expect(() => service.approve("INV-001", director)).toThrow(
      "Only pending invoices can be approved.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it("rejects approval when the invoice does not exist", () => {
    expect(() => service.approve("UNKNOWN", manager)).toThrow(
      "Invoice not found.",
    );
  });
});
