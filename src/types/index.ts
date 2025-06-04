export type UserRole = 'admin' | 'cashier';

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

export interface CartItem extends Item {
  quantityInCart: number;
}

export type ReceiptField = 
  | 'itemId' 
  | 'itemName' 
  | 'itemPrice' 
  | 'itemQuantity' 
  | 'itemSubtotal' 
  | 'discount' // Not implemented in this version, but good for future
  | 'grandTotal'
  | 'itemCategory'
  | 'timestamp'
  | 'shopName'
  | 'shopAddress'
  | 'shopContact';

export type ReceiptSettings = {
  [K in ReceiptField]?: boolean;
} & { shopName?: string; shopAddress?: string; shopContact?: string; };


export interface SaleTransaction {
  id: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    pricePerUnit: number;
    subtotal: number;
  }[];
  totalAmount: number;
  timestamp: Date;
  receiptSettingsSnapshot: ReceiptSettings; // Settings used for this specific sale
}
