'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getItems, processSale, getReceiptSettings as fetchReceiptSettings } from '@/lib/actions';
import type { Item, CartItem, ReceiptSettings, SaleTransaction, ReceiptField } from '@/types';
import { PlusCircle, MinusCircle, Trash2, Search, X, Printer, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Image from 'next/image';

const POSPage: React.FC = () => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [lastSale, setLastSale] = useState<SaleTransaction | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  const { toast } = useToast();

  const loadItemsAndSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, settingsData] = await Promise.all([getItems(), fetchReceiptSettings()]);
      setAllItems(itemsData);
      setFilteredItems(itemsData);
      setReceiptSettings(settingsData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load items or settings.', variant: 'destructive' });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadItemsAndSettings();
  }, [loadItemsAndSettings]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredItems(
      allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          (item.category && item.category.toLowerCase().includes(lowerSearchTerm)) ||
          item.id.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, allItems]);

  const addToCart = (item: Item) => {
    if (item.stock <= 0) {
      toast({ title: 'Out of Stock', description: `${item.name} is currently out of stock.`, variant: 'destructive' });
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        if (existingItem.quantityInCart < item.stock) {
          return prevCart.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantityInCart: cartItem.quantityInCart + 1 } : cartItem
          );
        } else {
          toast({ title: 'Stock Limit', description: `Cannot add more ${item.name}. Max stock available.`, variant: 'destructive'});
          return prevCart;
        }
      }
      return [...prevCart, { ...item, quantityInCart: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantityInCart > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantityInCart: cartItem.quantityInCart - 1 } : cartItem
        );
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const removeAllFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantityInCart, 0);

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast({ title: 'Empty Cart', description: 'Please add items to the cart before processing sale.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      const { sale: newSale, lowStockAlerts } = await processSale(cart, totalAmount);
      setLastSale(newSale);
      setShowReceiptDialog(true);
      toast({
        title: 'Sale Processed!',
        description: `Sale ${newSale.id} completed successfully. Total: LKR ${newSale.totalAmount.toFixed(2)}`,
        action: <CheckCircle className="text-green-500" />,
      });
      lowStockAlerts.forEach(alertMsg => {
        toast({ title: 'Low Stock Alert', description: alertMsg, variant: 'destructive' });
      });
      setCart([]);
      setSearchTerm('');
      await loadItemsAndSettings(); // Refresh items to reflect new stock
    } catch (error) {
      toast({ title: 'Sale Error', description: 'Failed to process sale.', variant: 'destructive' });
    }
    setIsProcessing(false);
  };
  
  const renderReceiptField = (field: ReceiptField, item?: CartItem, sale?: SaleTransaction) => {
    if (!receiptSettings || !receiptSettings[field] || !sale) return null;

    switch (field) {
      case 'shopName': return <p className="text-center text-lg font-bold">{receiptSettings.shopName}</p>;
      case 'shopAddress': return <p className="text-center text-xs">{receiptSettings.shopAddress}</p>;
      case 'shopContact': return <p className="text-center text-xs mb-2">{receiptSettings.shopContact}</p>;
      case 'timestamp': return <p className="text-xs">Date: {new Date(sale.timestamp).toLocaleString()}</p>;
      case 'grandTotal': return <p className="text-right font-bold mt-2">Total: LKR {sale.totalAmount.toFixed(2)}</p>;
      default: return null;
    }
  };
  
  const renderReceiptItemField = (field: ReceiptField, saleItem: SaleTransaction['items'][0]) => {
     if (!receiptSettings || !receiptSettings[field] ) return null;
     switch(field) {
        case 'itemId': return <span className="text-xs text-muted-foreground"> ({saleItem.itemId})</span>;
        case 'itemName': return <span>{saleItem.name}</span>;
        case 'itemQuantity': return <span>{saleItem.quantity} x </span>;
        case 'itemPrice': return <span>LKR {saleItem.pricePerUnit.toFixed(2)}</span>;
        case 'itemSubtotal': return <span className="text-right">LKR {saleItem.subtotal.toFixed(2)}</span>;
        default: return null;
     }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading POS...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'cashier']}>
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-var(--header-height,60px)-2rem)]">
      {/* Items Panel */}
      <Card className="lg:w-2/3 flex flex-col shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Available Items</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-0.5 h-7 w-7" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${item.stock === 0 ? 'opacity-50' : ''}`}>
                    <div className="relative w-full h-32 bg-muted-foreground/10">
                       <Image src={`https://placehold.co/300x200.png?text=${encodeURIComponent(item.name)}`} alt={item.name} layout="fill" objectFit="cover" data-ai-hint="product grocery item" />
                       {item.stock <= (receiptSettings?.lowStockThreshold || 10) && item.stock > 0 && (
                         <span className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">Low Stock</span>
                       )}
                       {item.stock === 0 && (
                         <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">Out of Stock</span>
                       )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold truncate" title={item.name}>{item.name}</h3>
                      <p className="text-sm text-primary font-bold">LKR {item.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => addToCart(item)}
                        disabled={item.stock === 0}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No items match your search or no items available.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cart Panel */}
      <Card className="lg:w-1/3 flex flex-col shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Current Sale</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-2">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Cart is empty</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span>{item.quantityInCart}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addToCart(item)} disabled={item.quantityInCart >= item.stock}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">LKR {(item.price * item.quantityInCart).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeAllFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4 border-t">
          <div className="flex justify-between w-full text-xl font-bold">
            <span>Total:</span>
            <span>LKR {totalAmount.toFixed(2)}</span>
          </div>
          <Button className="w-full h-12 text-lg" onClick={handleProcessSale} disabled={cart.length === 0 || isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Sale'}
          </Button>
        </CardFooter>
      </Card>

      {/* Receipt Dialog */}
      {lastSale && receiptSettings && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center"><Printer className="mr-2 h-5 w-5"/>Digital Receipt</DialogTitle>
              <DialogDescription>
                Sale ID: {lastSale.id}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1">
              <div className="p-4 border rounded-md bg-background font-mono text-sm">
                {renderReceiptField('shopName', undefined, lastSale)}
                {renderReceiptField('shopAddress', undefined, lastSale)}
                {renderReceiptField('shopContact', undefined, lastSale)}
                {renderReceiptField('timestamp', undefined, lastSale)}
                <hr className="my-2 border-dashed" />
                {lastSale.items.map(item => (
                  <div key={item.itemId} className="grid grid-cols-[1fr_auto] gap-x-2 py-0.5">
                    <div>
                      {renderReceiptItemField('itemName', item)}
                      {renderReceiptItemField('itemId', item)}
                    </div>
                    <div className="text-right">{renderReceiptItemField('itemSubtotal', item)}</div>
                    {(receiptSettings.itemQuantity || receiptSettings.itemPrice) && (
                      <div className="text-xs text-muted-foreground col-span-2 ml-2">
                        {renderReceiptItemField('itemQuantity', item)}
                        {renderReceiptItemField('itemPrice', item)}
                      </div>
                    )}
                  </div>
                ))}
                <hr className="my-2 border-dashed" />
                {renderReceiptField('grandTotal', undefined, lastSale)}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setShowReceiptDialog(false)}>Close</Button>
              <Button variant="outline" onClick={() => typeof window !== "undefined" && window.print()}><Printer className="mr-2 h-4 w-4"/> Print (Simulated)</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </ProtectedRoute>
  );
};

export default POSPage;
