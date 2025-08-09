import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, MapPin, Shield, CheckCircle, TrendingUp } from "lucide-react";

const Index = () => {
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
              <Button variant="electoral" size="lg" onClick={() => window.location.href = '/admin'}>
                <BarChart3 className="mr-2 h-5 w-5" />
                Painel Administrativo
              </Button>
              <Button variant="secondary" size="lg" onClick={() => window.location.href = '/field'}>
                <Users className="mr-2 h-5 w-5" />
                Interface de Campo
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
