import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrder } from '@/context/OrderContext';
import { SalesTax, ApiSalesTax, transformApiTax } from '@/types/taxes-api';

export const useTaxesData = (title?: string) => {
  const [taxes, setTaxes] = useState<SalesTax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useOrder();

  useEffect(() => {
    const fetchTaxes = async () => {
      if (!currentUser?.sid) {
        setError('No active session');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: invokeError } = await supabase.functions.invoke('get-taxes', {
          body: { 
            sid: currentUser.sid,
            title: title || undefined 
          },
        });

        if (invokeError) {
          throw new Error(invokeError.message);
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        const apiTaxes: ApiSalesTax[] = data?.data || [];
        const transformedTaxes = apiTaxes.map(transformApiTax);
        
        setTaxes(transformedTaxes);
        console.log('Taxes loaded:', transformedTaxes.length, 'items');

      } catch (err) {
        console.error('Error fetching taxes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch taxes');
        setTaxes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxes();
  }, [currentUser?.sid, title]);

  return { taxes, loading, error, refetch: () => {} };
};
