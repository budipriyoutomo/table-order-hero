// POS Invoice Item from API
export interface ApiPosInvoiceItem {
  name: string;
  item_code: string;
  item_name: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  net_rate: number;
  net_amount: number;
  base_rate: number;
  base_amount: number;
  uom: string;
  category: string;
  quick_notes: string;
  add_ons: string;
  status_kitchen: string;
  void_qty: number;
  void_rate: number;
  void_amount: number;
  idx: number;
  discount_percentage: number;
  discount_amount: number;
  resto_menu: string;
  image: string;
  warehouse: string;
}

// Tax entry from API
export interface ApiPosInvoiceTax {
  name: string;
  charge_type: string;
  account_head: string;
  description: string;
  rate: number;
  tax_amount: number;
  base_tax_amount: number;
  total: number;
  base_total: number;
  idx: number;
}

// Payment entry from API
export interface ApiPosInvoicePayment {
  name: string;
  mode_of_payment: string;
  amount: number;
  base_amount: number;
  account: string;
  idx: number;
}

// Full POS Invoice from API
export interface ApiPosInvoice {
  name: string;
  docstatus: number;
  status: string;
  posting_date: string;
  posting_time: string;
  creation: string;
  modified: string;
  
  // Customer info
  customer: string;
  customer_name: string;
  
  // Order info
  order_type: string;
  pos_profile: string;
  branch: string;
  company: string;
  
  // Totals
  total: number;
  net_total: number;
  base_total: number;
  base_net_total: number;
  grand_total: number;
  base_grand_total: number;
  rounded_total: number;
  base_rounded_total: number;
  total_qty: number;
  
  // Taxes and charges
  total_taxes_and_charges: number;
  base_total_taxes_and_charges: number;
  taxes_and_charges: string;
  taxes: ApiPosInvoiceTax[];
  
  // Payments
  paid_amount: number;
  base_paid_amount: number;
  outstanding_amount: number;
  change_amount: number;
  payments: ApiPosInvoicePayment[];
  
  // Discount
  discount_amount: number;
  additional_discount_percentage: number;
  apply_discount_on: string;
  
  // Items
  items: ApiPosInvoiceItem[];
  
  // Currency
  currency: string;
  price_list_currency: string;
  conversion_rate: number;
  
  // Other
  remarks: string;
  in_words: string;
  base_in_words: string;
  is_return: number;
  is_pos: number;
}

// Transformed invoice item for frontend
export interface PosInvoiceItem {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
  notes: string;
  addOns: string;
  kitchenStatus: string;
  voidQty: number;
  image: string;
  idx: number;
}

// Transformed tax for frontend
export interface PosInvoiceTax {
  id: string;
  description: string;
  rate: number;
  amount: number;
  total: number;
}

// Transformed payment for frontend
export interface PosInvoicePayment {
  id: string;
  mode: string;
  amount: number;
}

// Transformed full invoice for frontend
export interface PosInvoice {
  id: string;
  status: string;
  postingDate: string;
  postingTime: string;
  createdAt: string;
  
  // Customer
  customer: string;
  customerName: string;
  
  // Order info
  orderType: string;
  posProfile: string;
  branch: string;
  
  // Totals
  subtotal: number;
  netTotal: number;
  grandTotal: number;
  roundedTotal: number;
  totalQty: number;
  
  // Taxes
  taxesAndChargesTemplate: string;
  totalTaxes: number;
  taxes: PosInvoiceTax[];
  
  // Payments
  paidAmount: number;
  outstandingAmount: number;
  changeAmount: number;
  payments: PosInvoicePayment[];
  
  // Discount
  discountAmount: number;
  discountPercentage: number;
  
  // Items
  items: PosInvoiceItem[];
  
  // Currency
  currency: string;
  
  // Other
  remarks: string;
  inWords: string;
  isReturn: boolean;
}

// Transform API item to frontend item
export const transformApiInvoiceItem = (item: ApiPosInvoiceItem): PosInvoiceItem => ({
  id: item.name,
  itemCode: item.item_code,
  name: item.item_name,
  description: item.description,
  quantity: item.qty,
  rate: item.rate,
  amount: item.amount,
  category: item.category || '',
  notes: item.quick_notes || '',
  addOns: item.add_ons || '',
  kitchenStatus: item.status_kitchen || '',
  voidQty: item.void_qty || 0,
  image: item.image || '',
  idx: item.idx,
});

// Transform API tax to frontend tax
export const transformApiInvoiceTax = (tax: ApiPosInvoiceTax): PosInvoiceTax => ({
  id: tax.name,
  description: tax.description,
  rate: tax.rate,
  amount: tax.tax_amount,
  total: tax.total,
});

// Transform API payment to frontend payment
export const transformApiInvoicePayment = (payment: ApiPosInvoicePayment): PosInvoicePayment => ({
  id: payment.name,
  mode: payment.mode_of_payment,
  amount: payment.amount,
});

// Transform full API invoice to frontend invoice
export const transformApiInvoice = (invoice: ApiPosInvoice): PosInvoice => ({
  id: invoice.name,
  status: invoice.status,
  postingDate: invoice.posting_date,
  postingTime: invoice.posting_time,
  createdAt: invoice.creation,
  
  customer: invoice.customer,
  customerName: invoice.customer_name,
  
  orderType: invoice.order_type,
  posProfile: invoice.pos_profile,
  branch: invoice.branch,
  
  subtotal: invoice.total,
  netTotal: invoice.net_total,
  grandTotal: invoice.grand_total,
  roundedTotal: invoice.rounded_total,
  totalQty: invoice.total_qty,
  
  taxesAndChargesTemplate: invoice.taxes_and_charges,
  totalTaxes: invoice.total_taxes_and_charges,
  taxes: (invoice.taxes || []).map(transformApiInvoiceTax),
  
  paidAmount: invoice.paid_amount,
  outstandingAmount: invoice.outstanding_amount,
  changeAmount: invoice.change_amount,
  payments: (invoice.payments || []).map(transformApiInvoicePayment),
  
  discountAmount: invoice.discount_amount,
  discountPercentage: invoice.additional_discount_percentage,
  
  items: (invoice.items || []).map(transformApiInvoiceItem),
  
  currency: invoice.currency,
  
  remarks: invoice.remarks,
  inWords: invoice.in_words,
  isReturn: invoice.is_return === 1,
});
