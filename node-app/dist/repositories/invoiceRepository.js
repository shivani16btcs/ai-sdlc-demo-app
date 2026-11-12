export class InvoiceRepository {
    invoices = new Map();
    create(invoice) {
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }
    findById(id) {
        return this.invoices.get(id);
    }
    findAll() {
        return Array.from(this.invoices.values());
    }
    update(invoice) {
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }
}
