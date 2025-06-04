'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getReceiptSettings, updateReceiptSettings, getAIRestockSuggestions } from '@/lib/actions';
import type { ReceiptSettings, ReceiptField } from '@/types';
import type { SuggestRestockLevelsOutput } from '@/ai/flows/restocking-suggestion';
import { FileText, Settings2, Brain, AlertTriangle, ShoppingBasket, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const receiptSettingsSchema = z.object({
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
  shopContact: z.string().optional(),
  itemId: z.boolean().optional(),
  itemName: z.boolean().optional(),
  itemPrice: z.boolean().optional(),
  itemQuantity: z.boolean().optional(),
  itemSubtotal: z.boolean().optional(),
  grandTotal: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  itemCategory: z.boolean().optional(), // Added for completeness
});

type ReceiptSettingsFormData = z.infer<typeof receiptSettingsSchema>;

type RestockSuggestion = {
  itemName: string;
  suggestedRestockQuantity: number | string;
};

const receiptFields: { id: ReceiptField; label: string; type: 'text' | 'switch'; group: 'Shop Info' | 'Item Details' | 'Totals & Meta' }[] = [
  { id: 'shopName', label: 'Shop Name', type: 'text', group: 'Shop Info'},
  { id: 'shopAddress', label: 'Shop Address', type: 'text', group: 'Shop Info'},
  { id: 'shopContact', label: 'Shop Contact', type: 'text', group: 'Shop Info'},
  { id: 'itemId', label: 'Show Item ID', type: 'switch', group: 'Item Details' },
  { id: 'itemName', label: 'Show Item Name', type: 'switch', group: 'Item Details' },
  { id: 'itemPrice', label: 'Show Item Price', type: 'switch', group: 'Item Details' },
  { id: 'itemQuantity', label: 'Show Item Quantity', type: 'switch', group: 'Item Details' },
  { id: 'itemSubtotal', label: 'Show Item Subtotal', type: 'switch', group: 'Item Details' },
  { id: 'itemCategory', label: 'Show Item Category', type: 'switch', group: 'Item Details' },
  { id: 'grandTotal', label: 'Show Grand Total', type: 'switch', group: 'Totals & Meta' },
  { id: 'timestamp', label: 'Show Timestamp', type: 'switch', group: 'Totals & Meta' },
];


const SettingsPage: React.FC = () => {
  const [currentSettings, setCurrentSettings] = useState<ReceiptSettings | null>(null);
  const [restockSuggestions, setRestockSuggestions] = useState<RestockSuggestion[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReceiptSettingsFormData>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {},
  });

  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const settingsData = await getReceiptSettings();
      setCurrentSettings(settingsData);
      reset(settingsData); // Populate form with current settings
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load receipt settings.', variant: 'destructive' });
    }
    setIsLoadingSettings(false);
  }, [toast, reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSettingsSubmit: SubmitHandler<ReceiptSettingsFormData> = async (data) => {
    try {
      await updateReceiptSettings(data);
      toast({ title: 'Success', description: 'Receipt settings updated.' });
      await fetchSettings(); // Re-fetch to confirm
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update settings.', variant: 'destructive' });
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setRestockSuggestions([]);
    try {
      const result = await getAIRestockSuggestions();
      if ('error' in result) {
        toast({ title: 'AI Error', description: result.error, variant: 'destructive' });
      } else {
        const suggestions = JSON.parse(result.restockSuggestions) as RestockSuggestion[];
        setRestockSuggestions(suggestions);
        toast({ title: 'Suggestions Generated', description: 'Restock suggestions are ready.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate restock suggestions.', variant: 'destructive' });
    }
    setIsLoadingSuggestions(false);
  };

  const renderGroupedFields = (groupName: string) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 font-headline text-primary">{groupName}</h3>
        <div className="space-y-4">
        {receiptFields
          .filter(field => field.group === groupName)
          .map((field) => (
            <div key={field.id} className={field.type === 'switch' ? "flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card" : ""}>
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </Label>
              {field.type === 'switch' ? (
                <Controller
                  name={field.id as keyof ReceiptSettingsFormData}
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <Switch
                      id={field.id}
                      checked={!!value}
                      onCheckedChange={onChange}
                      ref={ref}
                    />
                  )}
                />
              ) : (
                 <Input id={field.id} {...register(field.id as keyof ReceiptSettingsFormData)} className="mt-1" />
              )}
              {errors[field.id as keyof ReceiptSettingsFormData] && (
                <p className="text-sm text-destructive mt-1 col-span-2">{errors[field.id as keyof ReceiptSettingsFormData]?.message}</p>
              )}
            </div>
          ))}
          </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold font-headline mb-8 text-foreground">Application Settings</h1>

        <Tabs defaultValue="receipt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="receipt" className="text-base py-2.5">
              <FileText className="mr-2 h-5 w-5" /> Receipt Customization
            </TabsTrigger>
            <TabsTrigger value="restock" className="text-base py-2.5">
              <Brain className="mr-2 h-5 w-5" /> Restocking Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Receipt Customization Tab */}
          <TabsContent value="receipt">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Settings2 className="mr-2 h-6 w-6 text-primary"/>Customize Receipt Details</CardTitle>
                <CardDescription>Choose which details appear on the sales receipt.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSettings ? (
                  <p className="text-center text-muted-foreground">Loading settings...</p>
                ) : (
                  <form onSubmit={handleSubmit(onSettingsSubmit)} className="space-y-8">
                    {renderGroupedFields('Shop Info')}
                    {renderGroupedFields('Item Details')}
                    {renderGroupedFields('Totals & Meta')}
                    <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Receipt Settings'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restocking Suggestions Tab */}
          <TabsContent value="restock">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><ShoppingBasket className="mr-2 h-6 w-6 text-primary"/>AI-Powered Restocking</CardTitle>
                <CardDescription>Get intelligent suggestions for item restocking based on recent sales data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerateSuggestions} disabled={isLoadingSuggestions} className="mb-6 w-full md:w-auto">
                  {isLoadingSuggestions ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    'Generate Restock Suggestions'
                  )}
                </Button>

                {restockSuggestions.length > 0 ? (
                  <ScrollArea className="h-[400px] border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead className="text-right">Suggested Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restockSuggestions.map((suggestion, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{suggestion.itemName}</TableCell>
                            <TableCell className="text-right">{suggestion.suggestedRestockQuantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  !isLoadingSuggestions && <p className="text-center text-muted-foreground">Click the button to generate suggestions.</p>
                )}
                {isLoadingSuggestions && restockSuggestions.length === 0 && (
                   <p className="text-center text-muted-foreground">The AI is thinking... This might take a moment.</p>
                )}
                <Card className="mt-6 bg-accent/20 border-accent/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center text-accent-foreground/80">
                      <AlertTriangle className="h-5 w-5 mr-2 text-accent" />How it works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-accent-foreground/70">
                    This tool uses GenAI to analyze recent sales patterns and suggests optimal restocking levels. Ensure your sales history is up-to-date for best results. Suggestions are advisory.
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
