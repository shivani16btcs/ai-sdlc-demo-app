export class ApprovalService {
    invoiceRepository;
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    approve(invoiceId, user) {
        const invoice = this.invoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new Error("Invoice not found.");
        }
        if (invoice.approvals.some((approval) => approval.approverId === user.id)) {
            throw new Error("The same user cannot approve an invoice twice.");
        }
        if (invoice.status !== "PENDING") {
            throw new Error("Only pending invoices can be approved.");
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
        if (invoice.approvals.length === 0) {
            return this.recordApproval(invoice, user, "PENDING");
        }
        // The second approver must be a Director.
        if (user.role !== "DIRECTOR") {
            throw new Error("The second approver must be a Director.");
        }
        if (invoice.approvals.length === 1) {
            return this.recordApproval(invoice, user, "APPROVED");
        }
        throw new Error("Invoice has already received the required approvals.");
    }
    recordApproval(invoice, user, status) {
        const updatedInvoice = {
            ...invoice,
            approvals: [
                ...invoice.approvals,
                {
                    approverId: user.id,
                    approverRole: user.role,
                    approvedAt: new Date()
                }
            ],
            status
        };
        return this.invoiceRepository.update(updatedInvoice);
    }
}
