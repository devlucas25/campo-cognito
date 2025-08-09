import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  Smartphone,
  Upload,
  Download,
  Battery,
  Signal
} from "lucide-react";

const FieldInterface = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(3);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setAccuracy(position.coords.accuracy);
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const assignments = [
    {
      id: "municipal-zona-norte",
      title: "Pesquisa Municipal 2024",
      area: "Zona Norte",
      completed: 23,
      target: 50,
      status: "active",
      priority: "alta"
    },
    {
      id: "federal-centro",
      title: "Intenção de Voto Federal",
      area: "Centro",
      completed: 15,
      target: 30,
      status: "active",
      priority: "média"
    }
  ];

  const recentCollections = [
    { time: "14:35", location: "Rua das Flores, 123", status: "synced" },
    { time: "14:28", location: "Av. Central, 456", status: "synced" },
    { time: "14:15", location: "Praça da Liberdade", status: "pending" },
  ];

  const handleStartSurvey = (assignmentId: string) => {
    window.location.href = `/survey/${assignmentId}`;
  };

  const handleSync = () => {
    // Simulate sync process
    console.log("Synchronizing data...");
    setPendingSync(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with status */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Campo Quest
              </h1>
              <p className="text-sm text-muted-foreground">Entrevistador</p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-success" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
                <span className="text-xs">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs">
                    GPS {accuracy ? `±${Math.round(accuracy)}m` : ""}
                  </span>
                </div>
              )}
              
              {pendingSync > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Sync ({pendingSync})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Connection Status Card */}
        {!isOnline && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Modo Offline Ativo</p>
                  <p className="text-sm text-muted-foreground">
                    As entrevistas serão salvas localmente e sincronizadas quando a conexão for restabelecida.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">38</p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">80</p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Áreas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{pendingSync}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Atribuições Ativas</CardTitle>
            <CardDescription>
              Suas pesquisas em andamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignment.area}
                    </p>
                  </div>
                  <Badge variant={
                    assignment.priority === 'alta' ? 'destructive' :
                    assignment.priority === 'média' ? 'default' : 'secondary'
                  }>
                    {assignment.priority}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{assignment.completed}/{assignment.target}</span>
                  </div>
                  <Progress
                    value={(assignment.completed / assignment.target) * 100}
                    className="h-2"
                  />
                </div>
                
                <Button
                  variant="electoral"
                  className="w-full"
                  onClick={() => handleStartSurvey(assignment.id)}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Iniciar Entrevista
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Coletas Recentes</CardTitle>
            <CardDescription>
              Últimas entrevistas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCollections.map((collection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      collection.status === 'synced' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {collection.status === 'synced' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collection.time}</p>
                      <p className="text-xs text-muted-foreground">{collection.location}</p>
                    </div>
                  </div>
                  <Badge variant={collection.status === 'synced' ? 'secondary' : 'outline'}>
                    {collection.status === 'synced' ? 'Sincronizado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FieldInterface;