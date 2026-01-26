export interface ApiSalesTax {
  name: string;
  title: string;
}

export interface SalesTax {
  id: string;
  name: string;
  title: string;
}

export const transformApiTax = (apiTax: ApiSalesTax): SalesTax => ({
  id: apiTax.name,
  name: apiTax.name,
  title: apiTax.title,
});
