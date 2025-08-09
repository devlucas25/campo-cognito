import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Shield,
  CheckCircle,
  Clock,
  Database,
  Smartphone,
  Globe,
  ArrowRight,
  LogOut,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeDemo, setActiveDemo] = useState("admin");
  const { user, signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Campo Quest
              </h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo de volta! Selecione sua área de trabalho.
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin Dashboard */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Painel Administrativo</CardTitle>
                <CardDescription>
                  Gerencie pesquisas, analise dados e monitore entrevistadores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Criar e editar pesquisas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Relatórios e analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Monitoramento em tempo real</span>
                  </div>
                </div>
                {isAdmin ? (
                  <Button 
                    className="w-full" 
                    onClick={() => handleNavigation('/admin')}
                  >
                    Acessar Painel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="text-center py-2">
                    <Badge variant="secondary">Acesso Restrito</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Apenas administradores
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Field Interface */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Interface de Campo</CardTitle>
                <CardDescription>
                  Colete entrevistas com GPS e funcionalidade offline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Formulários offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>GPS automático</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Sincronização inteligente</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="electoral"
                  onClick={() => handleNavigation('/field')}
                >
                  Iniciar Coleta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">±2.1%</div>
              <div className="text-sm text-muted-foreground">Margem Erro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">GPS</div>
              <div className="text-sm text-muted-foreground">Alta Precisão</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  const features = [
    { 
      icon: Shield, 
      title: "Segurança LGPD", 
      desc: "Conformidade total com proteção de dados e consentimento obrigatório" 
    },
    { 
      icon: Users, 
      title: "Gestão Multiusuário", 
      desc: "Administradores e entrevistadores com permissões granulares" 
    },
    { 
      icon: MapPin, 
      title: "Geolocalização Precisa", 
      desc: "Validação GPS automática e mapeamento de áreas de coleta" 
    },
    { 
      icon: CheckCircle, 
      title: "Modo Offline Avançado", 
      desc: "Coleta em campo sem internet com sincronização automática" 
    },
    { 
      icon: BarChart3, 
      title: "Analytics Profissional", 
      desc: "Relatórios estatísticos com cálculo de margem de erro" 
    },
    { 
      icon: TrendingUp, 
      title: "Dashboard Real-time", 
      desc: "Monitoramento em tempo real do progresso das pesquisas" 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="space-y-8">
            <Badge variant="secondary" className="mb-4">
              Sistema Profissional de Pesquisas Eleitorais
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Campo Quest
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
              Plataforma completa para pesquisas eleitorais em campo com tecnologia offline-first, 
              análise estatística profissional e conformidade LGPD
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button variant="electoral" size="lg" onClick={() => navigate('/login')}>
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setActiveDemo("demo")}>
                Ver Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/90 backdrop-blur-sm shadow-electoral border-0">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Technical Specs */}
          <Card className="bg-card/90 backdrop-blur-sm shadow-electoral border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Especificações Técnicas</CardTitle>
              <CardDescription>
                Stack moderna e profissional para máxima performance
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• React 18 + TypeScript</li>
                  <li>• Tailwind CSS + Radix UI</li>
                  <li>• Service Worker</li>
                  <li>• IndexedDB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Supabase PostgreSQL</li>
                  <li>• Row Level Security</li>
                  <li>• Edge Functions</li>
                  <li>• Real-time Sync</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Geolocalização</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Leaflet Maps</li>
                  <li>• GPS Validation</li>
                  <li>• Área Assignment</li>
                  <li>• Accuracy Control</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Analytics</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Recharts Dashboard</li>
                  <li>• Margem de Erro</li>
                  <li>• Export CSV/Excel</li>
                  <li>• LGPD Compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;