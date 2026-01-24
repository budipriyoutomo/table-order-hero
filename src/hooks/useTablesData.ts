import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrder } from '@/context/OrderContext';
import { ApiTable, TableData, transformApiTable } from '@/types/api';

export const useTablesData = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, logout } = useOrder();

  const fetchTables = useCallback(async () => {
    if (!currentUser?.sid) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-tables', {
        body: {
          sid: currentUser.sid, // Only send session ID, not credentials
        },
      });

      if (fnError) {
        console.error('Fetch tables error:', fnError);
        setError('Failed to fetch tables');
        return;
      }

      // Handle session expiration
      if (data?.code === 'SESSION_EXPIRED' || data?.code === 'NO_SESSION') {
        setError('Session expired, please login again');
        logout(); // Force re-login
        return;
      }

      if (data?.success && data?.tables) {
        const transformedTables = data.tables.map((table: ApiTable) => 
          transformApiTable(table)
        );
        setTables(transformedTables);
      } else if (data?.error) {
        setError(data.error);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, logout]);

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
