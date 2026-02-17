
export enum PaymentMethod {
  CASH = 'نقداً (رسوم 1%)',
  CASH_NO_FEE = 'نقداً بدون رسوم',
  CHECK = 'شيك بنكي'
}

export enum TVARate {
  RATE_0 = 0,
  RATE_9 = 9,
  RATE_19 = 19
}

export interface BusinessEntity {
  id: string;
  name: string;
  location: string;
  nif: string;
  nis: string;
  article: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  supplierId: string;
  purchaseDate: string;
  invoiceNumber: string;
  purchasePriceHT: number;
  tva: number;
  totalPriceTTC: number;
  quantity: number; // Current stock level
  initialQuantity: number; // Total supplied quantity (remains constant for supplier records)
  unitSalePrice: number;
  expiryDate?: string;
}

export interface InvoiceItem {
  itemId: string;
  quantity: number;
  salePrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  date: string;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  fee: number;
  tvaRate: number; // Dynamic TVA rate for the whole invoice
  tvaAmount: number;
  discount: number;
  totalTTC: number;
  type: 'sale' | 'purchase';
}

export interface UserProfile {
  email: string;
  companyName: string;
  location: string;
  ownerName: string;
  phone: string;
  nif: string;
  nis: string;
  article: string;
}
