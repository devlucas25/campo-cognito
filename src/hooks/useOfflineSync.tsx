import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncItem {
  id: string;
  type: 'response' | 'answer';
  data: any;
  timestamp: number;
  retries: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('campo_quest_sync_queue');
    if (savedQueue) {
      try {
        setSyncQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading sync queue:', error);
        localStorage.removeItem('campo_quest_sync_queue');
      }
    }
  }, []);

  // Save sync queue to localStorage
  const saveSyncQueue = useCallback((queue: SyncItem[]) => {
    localStorage.setItem('campo_quest_sync_queue', JSON.stringify(queue));
    setSyncQueue(queue);
  }, []);

  // Add item to sync queue
  const addToSyncQueue = useCallback((type: 'response' | 'answer', data: any) => {
    const item: SyncItem = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    const currentQueue = JSON.parse(localStorage.getItem('campo_quest_sync_queue') || '[]');
    const newQueue = [...currentQueue, item];
    saveSyncQueue(newQueue);

    if (isOnline) {
      syncData();
    }
  }, [isOnline, saveSyncQueue]);

  // Save data locally (offline storage)
  const saveOfflineData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`campo_quest_${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  }, []);

  // Get offline data
  const getOfflineData = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`campo_quest_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }, []);

  // Sync data when online
  const syncData = useCallback(async () => {
    if (!isOnline || syncing || syncQueue.length === 0) return;

    setSyncing(true);
    const currentQueue = [...syncQueue];
    const successfulSyncs: string[] = [];

    try {
      for (const item of currentQueue) {
        try {
          // Here you would implement the actual sync logic
          // For now, just simulate success
          await new Promise(resolve => setTimeout(resolve, 100));
          
          successfulSyncs.push(item.id);
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          
          // Increment retry count
          item.retries += 1;
          if (item.retries >= 3) {
            // Remove item after 3 failed attempts
            successfulSyncs.push(item.id);
            toast({
              variant: "destructive",
              title: "Erro de Sincronização",
              description: "Alguns dados não puderam ser sincronizados",
            });
          }
        }
      }

      // Remove successfully synced items
      const remainingQueue = currentQueue.filter(item => !successfulSyncs.includes(item.id));
      saveSyncQueue(remainingQueue);

      if (successfulSyncs.length > 0) {
        toast({
          title: "Sincronização Concluída",
          description: `${successfulSyncs.length} item(s) sincronizado(s)`,
        });
      }

    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing, syncQueue, saveSyncQueue, toast]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncData();
    }
  }, [isOnline, syncQueue.length, syncData]);

  return {
    isOnline,
    syncQueue,
    syncing,
    addToSyncQueue,
    saveOfflineData,
    getOfflineData,
    syncData,
    pendingCount: syncQueue.length
  };
}