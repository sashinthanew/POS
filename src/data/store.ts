import type { Item, SaleTransaction, ReceiptSettings } from '@/types';

interface Store {
  items: Item[];
  salesHistory: SaleTransaction[];
  receiptSettings: ReceiptSettings;
  lowStockThreshold: number;
}

// Initial data for the store
const store: Store = {
  items: [
    { id: 'ITM001', name: 'Keerisamba Rice 1kg', price: 250, stock: 100, category: 'Groceries' },
    { id: 'ITM002', name: 'Red Dhal 1kg', price: 450, stock: 80, category: 'Groceries' },
    { id: 'ITM003', name: 'Anchor Full Cream Milk Powder 400g', price: 980, stock: 50, category: 'Dairy' },
    { id: 'ITM004', name: 'White Sugar 1kg', price: 280, stock: 120, category: 'Groceries' },
    { id: 'ITM005', name: 'Laojee Tea Leaves 200g', price: 350, stock: 70, category: 'Beverages' },
    { id: 'ITM006', name: 'Sunlight Soap Bar', price: 80, stock: 150, category: 'Household' },
    { id: 'ITM007', name: 'Coca-Cola 1.5L', price: 300, stock: 60, category: 'Beverages' },
  ],
  salesHistory: [],
  receiptSettings: {
    shopName: 'LankaPOS Grocery',
    shopAddress: '123 Galle Road, Colombo 3',
    shopContact: '011-2345678',
    itemId: true,
    itemName: true,
    itemPrice: true,
    itemQuantity: true,
    itemSubtotal: true,
    grandTotal: true,
    timestamp: true,
  },
  lowStockThreshold: 10,
};

// Functions to interact with the store. These are NOT server actions themselves.
// Server actions will call these.

export const getItems = (): Item[] => {
  return JSON.parse(JSON.stringify(store.items)); // Return deep copy
};

export const getItemById = (id: string): Item | undefined => {
  const item = store.items.find(item => item.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
};

export const addItem = (item: Omit<Item, 'id'>): Item => {
  const newItem: Item = {
    ...item,
    id: `ITM${String(store.items.length + 1).padStart(3, '0')}`, // Simple ID generation
  };
  store.items.push(newItem);
  return JSON.parse(JSON.stringify(newItem));
};

export const updateItemStock = (itemId: string, quantitySold: number): Item | undefined => {
  const itemIndex = store.items.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    store.items[itemIndex].stock -= quantitySold;
    if (store.items[itemIndex].stock < 0) store.items[itemIndex].stock = 0; // Prevent negative stock
    return JSON.parse(JSON.stringify(store.items[itemIndex]));
  }
  return undefined;
};

export const addSaleTransaction = (sale: Omit<SaleTransaction, 'id' | 'timestamp' | 'receiptSettingsSnapshot'>): SaleTransaction => {
  const newSale: SaleTransaction = {
    ...sale,
    id: `SALE${String(store.salesHistory.length + 1).padStart(4, '0')}`,
    timestamp: new Date(),
    receiptSettingsSnapshot: JSON.parse(JSON.stringify(store.receiptSettings)),
  };
  store.salesHistory.push(newSale);
  return JSON.parse(JSON.stringify(newSale));
};

export const getSalesHistory = (): SaleTransaction[] => {
  return JSON.parse(JSON.stringify(store.salesHistory));
};

export const getReceiptSettings = (): ReceiptSettings => {
  return JSON.parse(JSON.stringify(store.receiptSettings));
};

export const updateReceiptSettings = (newSettings: Partial<ReceiptSettings>): ReceiptSettings => {
  store.receiptSettings = { ...store.receiptSettings, ...newSettings };
  return JSON.parse(JSON.stringify(store.receiptSettings));
};

export const getLowStockThreshold = (): number => {
  return store.lowStockThreshold;
};

export const getFormattedSalesDataForAI = (): string => {
  const recentSales = store.salesHistory.slice(-20); // Get last 20 sales for brevity
  const salesData = recentSales.flatMap(sale => 
    sale.items.map(item => ({
      itemName: item.name,
      quantitySold: item.quantity,
      saleDate: sale.timestamp.toISOString().split('T')[0] // Just date part
    }))
  );
  return JSON.stringify(salesData);
};
