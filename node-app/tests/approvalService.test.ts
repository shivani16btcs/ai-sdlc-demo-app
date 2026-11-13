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

  const secondDirector: User = {
    id: "director-2",
    name: "Director Two",
    role: "DIRECTOR",
  };

  const thirdApprover: User = {
    id: "manager-2",
    name: "Manager Two",
    role: "MANAGER",
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

  function expectApproval(invoice: Invoice, user: User): void {
    expect(invoice.approvals[0]).toMatchObject({
      approverId: user.id,
      approverName: user.name,
      approverRole: user.role,
    });
    expect(invoice.approvals[0].approvedAt).toBeInstanceOf(Date);
  }

  it("allows a Manager to approve 50,000 and records their identity and timestamp", () => {
    createInvoice(50000);

    const result = service.approve("INV-001", manager);

    expect(result.status).toBe("APPROVED");
    expect(result.approvals).toHaveLength(1);
    expectApproval(result, manager);
  });

  it("allows a Director to approve 50,000", () => {
    createInvoice(50000);

    const result = service.approve("INV-001", director);

    expect(result.status).toBe("APPROVED");
    expectApproval(result, director);
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
    "allows a Director to approve %i with a complete approval record",
    (amount) => {
      createInvoice(amount);

      const result = service.approve("INV-001", director);

      expect(result.status).toBe("APPROVED");
      expect(result.approvals).toHaveLength(1);
      expectApproval(result, director);
    },
  );

  it.each([manager, director])(
    "keeps a $500,001 invoice pending after first approval by $name",
    (firstApprover) => {
      createInvoice(500001);

      const result = service.approve("INV-001", firstApprover);

      expect(result.status).toBe("PENDING");
      expect(result.approvals).toHaveLength(1);
      expectApproval(result, firstApprover);
    },
  );

  it("approves a high-value invoice after a distinct Director's second approval", () => {
    createInvoice(500001);
    service.approve("INV-001", manager);

    const result = service.approve("INV-001", secondDirector);

    expect(result.status).toBe("APPROVED");
    expect(result.approvals).toHaveLength(2);
    expect(result.approvals[0]).toMatchObject({
      approverId: manager.id,
      approverName: manager.name,
      approverRole: manager.role,
    });
    expect(result.approvals[1]).toMatchObject({
      approverId: secondDirector.id,
      approverName: secondDirector.name,
      approverRole: secondDirector.role,
    });
    expect(result.approvals[0].approvedAt).toBeInstanceOf(Date);
    expect(result.approvals[1].approvedAt).toBeInstanceOf(Date);
  });

  it("rejects a Manager as second approver without changing the invoice", () => {
    createInvoice(500001);
    service.approve("INV-001", director);
    const originalSnapshot = structuredClone(repository.findById("INV-001"));

    expect(() => service.approve("INV-001", manager)).toThrow(
      "The second approver must be a Director.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it("rejects a duplicate approver without changing the invoice", () => {
    createInvoice(500001);
    service.approve("INV-001", director);
    const originalSnapshot = structuredClone(repository.findById("INV-001"));

    expect(() => service.approve("INV-001", director)).toThrow(
      "The same user cannot approve an invoice twice.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it("rejects a third approval after the invoice is approved without changing it", () => {
    createInvoice(600000);
    service.approve("INV-001", manager);
    service.approve("INV-001", secondDirector);
    const originalSnapshot = structuredClone(repository.findById("INV-001"));

    expect(() => service.approve("INV-001", director)).toThrow(
      "Only pending invoices can be approved.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it.each(["APPROVED", "REJECTED"] as const)(
    "rejects an invoice with %s status and leaves all data unchanged",
    (status) => {
      const invoice = createInvoice(50000);
      invoice.status = status;
      invoice.approvals = [
        {
          approverId: manager.id,
          approverName: manager.name,
          approverRole: manager.role,
          approvedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ];
      const originalSnapshot = structuredClone(invoice);

      expect(() => service.approve("INV-001", secondDirector)).toThrow(
        "Only pending invoices can be approved.",
      );

      expect(repository.findById("INV-001")).toEqual(originalSnapshot);
    },
  );

  it("rejects a pending invoice that already has two approvals without changing it", () => {
    const invoice = createInvoice(600000);
    const invoiceWithTwoApprovals: Invoice = {
      ...invoice,
      approvals: [
        {
          approverId: manager.id,
          approverName: manager.name,
          approverRole: manager.role,
          approvedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          approverId: director.id,
          approverName: director.name,
          approverRole: director.role,
          approvedAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ],
    };
    repository.update(invoiceWithTwoApprovals);
    const originalSnapshot = structuredClone(invoiceWithTwoApprovals);

    expect(() => service.approve("INV-001", thirdApprover)).toThrow(
      "Invoice has already received the required approvals.",
    );

    expect(repository.findById("INV-001")).toEqual(originalSnapshot);
  });

  it("rejects approval when the invoice does not exist", () => {
    expect(() => service.approve("UNKNOWN", manager)).toThrow(
      "Invoice not found.",
    );
  });
});
