import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrder } from '@/context/OrderContext';
import { PosInvoice, ApiPosInvoice, transformApiInvoice } from '@/types/pos-invoice-api';

interface UsePosInvoiceDataReturn {
  invoice: PosInvoice | null;
  isLoading: boolean;
  error: string | null;
  fetchInvoice: (invoiceId: string) => Promise<PosInvoice | null>;
  clearInvoice: () => void;
}

export const usePosInvoiceData = (): UsePosInvoiceDataReturn => {
  const [invoice, setInvoice] = useState<PosInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, logout } = useOrder();

  const fetchInvoice = useCallback(async (invoiceId: string): Promise<PosInvoice | null> => {
    if (!currentUser?.sid) {
      setError('Session tidak ditemukan');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching POS invoice:', invoiceId);
      
      const { data, error: fnError } = await supabase.functions.invoke('get-pos-invoice', {
        body: { 
          sid: currentUser.sid,
          invoiceId 
        },
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch invoice');
      }

      if (!data?.success) {
        // Handle session expiration
        if (data?.code === 'SESSION_EXPIRED' || data?.code === 'NO_SESSION') {
          logout();
          throw new Error('Sesi telah berakhir, silakan login kembali');
        }
        throw new Error(data?.error || 'Failed to fetch invoice');
      }

      const transformedInvoice = transformApiInvoice(data.invoice as ApiPosInvoice);
      setInvoice(transformedInvoice);
      console.log('Invoice fetched successfully:', transformedInvoice.id);
      return transformedInvoice;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data invoice';
      console.error('Fetch invoice error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.sid, logout]);

  const clearInvoice = useCallback(() => {
    setInvoice(null);
    setError(null);
  }, []);

  return {
    invoice,
    isLoading,
    error,
    fetchInvoice,
    clearInvoice,
  };
};
