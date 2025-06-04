'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getItems, addItem as addItemAction } from '@/lib/actions';
import type { Item } from '@/types';
import { PlusCircle, PackageSearch, DollarSign, Hash, ListChecks } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Image from 'next/image';

const itemSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const itemsData = await getItems();
      setItems(itemsData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load items.', variant: 'destructive' });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
    try {
      await addItemAction(data);
      toast({ title: 'Success', description: `${data.name} added successfully.` });
      reset();
      await fetchItems(); // Refresh the list
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item.', variant: 'destructive' });
    }
  };
  
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold font-headline mb-8 text-foreground">Item Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <Card className="lg:col-span-1 shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary"/> Add New Item</CardTitle>
              <CardDescription>Fill in the details to add a new item to the inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center"><PackageSearch className="mr-2 h-4 w-4 text-muted-foreground"/>Item Name</Label>
                  <Input id="name" {...register('name')} className="mt-1" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="price" className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground"/>Price (LKR)</Label>
                  <Input id="price" type="number" step="0.01" {...register('price')} className="mt-1" />
                  {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="stock" className="flex items-center"><Hash className="mr-2 h-4 w-4 text-muted-foreground"/>Initial Stock</Label>
                  <Input id="stock" type="number" {...register('stock')} className="mt-1" />
                  {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <Label htmlFor="category" className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-muted-foreground"/>Category (Optional)</Label>
                  <Input id="category" {...register('category')} className="mt-1" />
                  {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Item...' : 'Add Item'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="lg:col-span-2 shadow-xl flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">Current Inventory</CardTitle>
              <CardDescription>Overview of all items available in the store.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading items...</p>
              ) : items.length === 0 ? (
                 <p className="text-center text-muted-foreground">No items in inventory. Add items using the form.</p>
              ) : (
                <ScrollArea className="h-[500px] pr-4"> {/* Adjust height as needed */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Image src={`https://placehold.co/60x60.png?text=${encodeURIComponent(item.name[0])}`} alt={item.name} width={40} height={40} className="rounded" data-ai-hint="product initial"/>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{item.id}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">LKR {item.price.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-bold ${item.stock <= 10 ? 'text-destructive' : 'text-green-600'}`}>{item.stock}</TableCell>
                          <TableCell>{item.category || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ItemsPage;
