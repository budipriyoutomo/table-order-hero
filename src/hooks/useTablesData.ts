import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrder } from '@/context/OrderContext';
import { ApiTable, TableData, transformApiTable } from '@/types/api';

export const useTablesData = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useOrder();

  const fetchTables = useCallback(async () => {
    if (!currentUser?.api_key || !currentUser?.api_secret) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-tables', {
        body: {
          api_key: currentUser.api_key,
          api_secret: currentUser.api_secret,
        },
      });

      if (fnError) {
        console.error('Fetch tables error:', fnError);
        setError('Failed to fetch tables');
        return;
      }

      if (data?.success && data?.tables) {
        const transformedTables = data.tables.map((table: ApiTable) => 
          transformApiTable(table)
        );
        setTables(transformedTables);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    isLoading,
    error,
    refetch: fetchTables,
  };
};
