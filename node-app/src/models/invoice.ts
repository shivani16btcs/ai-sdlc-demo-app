export type InvoiceStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  approvals: Approval[];
}

export interface Approval {
  approverId: string;
  approverName: string;
  approverRole: "MANAGER" | "DIRECTOR";
  approvedAt: Date;
}
