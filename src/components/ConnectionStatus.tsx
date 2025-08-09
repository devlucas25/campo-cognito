import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatus({ showDetails = false, className }: ConnectionStatusProps) {
  const { isConnected, isChecking, lastChecked, error, retryConnection } = useSupabaseConnection();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isChecking) return 'secondary';
    if (isConnected) return 'default';
    return 'destructive';
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (isChecking) return RefreshCw;
    if (isConnected) return CheckCircle;
    return AlertTriangle;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isChecking) return 'Verificando...';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  if (!showDetails) {
    const StatusIcon = getStatusIcon();
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon className={cn(
          "h-4 w-4",
          isChecking && "animate-spin",
          isConnected && isOnline ? "text-success" : "text-destructive"
        )} />
        <span className="text-sm">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <Card className={cn("border-l-4", {
      "border-l-success": isConnected && isOnline,
      "border-l-destructive": !isConnected || !isOnline,
      "border-l-warning": isChecking
    }, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isConnected && isOnline ? "bg-success/10" : "bg-destructive/10"
            )}>
              {isOnline ? (
                <Wifi className={cn(
                  "h-4 w-4",
                  isConnected ? "text-success" : "text-destructive"
                )} />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status da Conexão</span>
                <Badge variant={getStatusColor()}>
                  {getStatusText()}
                </Badge>
              </div>
              
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
              
              {lastChecked && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Última verificação: {lastChecked.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={retryConnection}
            disabled={isChecking}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isChecking && "animate-spin"
            )} />
            {isChecking ? 'Verificando...' : 'Reconectar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}