import { useState, useEffect, useCallback } from 'react';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useSupabaseConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null
  });
  
  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      const isConnected = await checkSupabaseConnection();
      
      setStatus({
        isConnected,
        isChecking: false,
        lastChecked: new Date(),
        error: isConnected ? null : 'Falha na conexão com o servidor'
      });
      
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Conexão Perdida",
          description: "Tentando reconectar...",
        });
      }
      
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setStatus({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage
      });
      
      return false;
    }
  }, [toast]);

  // Initial connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Periodic connection health check
  useEffect(() => {
    const interval = setInterval(() => {
      if (!status.isChecking) {
        checkConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkConnection, status.isChecking]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online - checking Supabase connection');
      checkConnection();
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        error: 'Sem conexão com a internet'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Listen to Supabase auth state changes for connection validation
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Verify connection after auth events
          await checkConnection();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkConnection]);

  return {
    ...status,
    checkConnection,
    retryConnection: checkConnection
  };
}