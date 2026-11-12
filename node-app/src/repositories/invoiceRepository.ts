
import type { Invoice } from "../models/invoice.js";

export class InvoiceRepository {
  private invoices = new Map<string, Invoice>();

  create(invoice: Invoice): Invoice {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  findById(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  findAll(): Invoice[] {
    return Array.from(this.invoices.values());
  }

  update(invoice: Invoice): Invoice {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }
}
