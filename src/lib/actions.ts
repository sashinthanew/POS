'use server';

import { revalidatePath } from 'next/cache';
import { 
  getItems as dbGetItems,
  getItemById as dbGetItemById,
  addItem as dbAddItem,
  updateItemStock as dbUpdateItemStock,
  addSaleTransaction as dbAddSaleTransaction,
  getSalesHistory as dbGetSalesHistory,
  getReceiptSettings as dbGetReceiptSettings,
  updateReceiptSettings as dbUpdateReceiptSettings,
  getLowStockThreshold as dbGetLowStockThreshold,
  getFormattedSalesDataForAI
} from '@/data/store';
import type { Item, SaleTransaction, ReceiptSettings, CartItem } from '@/types';
import { suggestRestockLevels, type SuggestRestockLevelsInput, type SuggestRestockLevelsOutput } from '@/ai/flows/restocking-suggestion';

export async function getItems(): Promise<Item[]> {
  return dbGetItems();
}

export async function getItemById(id: string): Promise<Item | undefined> {
  return dbGetItemById(id);
}

export async function addItem(itemData: Omit<Item, 'id'>): Promise<Item> {
  const newItem = dbAddItem(itemData);
  revalidatePath('/app/items');
  revalidatePath('/app/sales');
  return newItem;
}

export async function processSale(cartItems: CartItem[], totalAmount: number): Promise<{sale: SaleTransaction, lowStockAlerts: string[]}> {
  const saleItems = cartItems.map(cartItem => ({
    itemId: cartItem.id,
    name: cartItem.name,
    quantity: cartItem.quantityInCart,
    pricePerUnit: cartItem.price,
    subtotal: cartItem.price * cartItem.quantityInCart,
  }));

  const sale = dbAddSaleTransaction({ items: saleItems, totalAmount });
  
  const lowStockAlerts: string[] = [];
  const lowStockThreshold = dbGetLowStockThreshold();

  for (const cartItem of cartItems) {
    const updatedItem = dbUpdateItemStock(cartItem.id, cartItem.quantityInCart);
    if (updatedItem && updatedItem.stock <= lowStockThreshold && updatedItem.stock > 0) {
      lowStockAlerts.push(`${updatedItem.name} is running low (Stock: ${updatedItem.stock})!`);
    } else if (updatedItem && updatedItem.stock === 0) {
      lowStockAlerts.push(`${updatedItem.name} is out of stock!`);
    }
  }

  revalidatePath('/app/sales');
  revalidatePath('/app/items'); // Stock levels changed
  revalidatePath('/app/settings'); // For restock suggestions
  return { sale, lowStockAlerts };
}

export async function getSalesHistory(): Promise<SaleTransaction[]> {
  return dbGetSalesHistory();
}

export async function getReceiptSettings(): Promise<ReceiptSettings> {
  return dbGetReceiptSettings();
}

export async function updateReceiptSettings(newSettings: Partial<ReceiptSettings>): Promise<ReceiptSettings> {
  const updated = dbUpdateReceiptSettings(newSettings);
  revalidatePath('/app/settings');
  return updated;
}

export async function getAIRestockSuggestions(): Promise<SuggestRestockLevelsOutput | { error: string }> {
  try {
    const salesData = getFormattedSalesDataForAI();
    if (salesData === "[]") { // No sales data
        return { restockSuggestions: JSON.stringify([{ itemName: "No sales data available", suggestedRestockQuantity: "N/A" }]) };
    }
    const input: SuggestRestockLevelsInput = { recentSalesData: salesData };
    const result = await suggestRestockLevels(input);
    return result;
  } catch (error) {
    console.error("Error getting AI restock suggestions:", error);
    return { error: "Failed to generate restocking suggestions." };
  }
}

export async function getLowStockThreshold(): Promise<number> {
    return dbGetLowStockThreshold();
}
