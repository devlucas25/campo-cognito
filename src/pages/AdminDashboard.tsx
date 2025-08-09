import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  MapPin, 
  PlusCircle, 
  Settings, 
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const AdminDashboard = () => {
  const [selectedSurvey, setSelectedSurvey] = useState("municipal-2024");

  const surveys = [
    {
      id: "municipal-2024",
      title: "Pesquisa Municipal 2024",
      target: 1200,
      completed: 847,
      status: "active",
      deadline: "2024-09-15"
    },
    {
      id: "federal-2024",
      title: "Intenção de Voto Federal",
      target: 2500,
      completed: 1234,
      status: "active",
      deadline: "2024-10-01"
    }
  ];

  const metrics = [
    { title: "Total de Entrevistas", value: "2,081", change: "+12%", icon: Users },
    { title: "Margem de Erro", value: "±2.1%", change: "-0.3%", icon: TrendingUp },
    { title: "Entrevistadores Ativos", value: "24", change: "+3", icon: CheckCircle },
    { title: "Áreas Cobertas", value: "156", change: "+8", icon: MapPin }
  ];

  const recentActivity = [
    { action: "Nova entrevista coletada", location: "Zona Norte", time: "há 2 min", interviewer: "Ana Silva" },
    { action: "Lote sincronizado", location: "Centro", time: "há 5 min", interviewer: "João Santos" },
    { action: "Área completada", location: "Zona Sul", time: "há 8 min", interviewer: "Maria Costa" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Campo Quest
            </h1>
            <p className="text-muted-foreground">Painel Administrativo</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="electoral" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Pesquisa
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                    <p className="text-xs text-success font-medium">
                      {metric.change} vs. semana anterior
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="surveys">Pesquisas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Survey Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Progresso das Pesquisas</CardTitle>
                  <CardDescription>
                    Acompanhe o andamento das coletas em campo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{survey.title}</span>
                        <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                          {survey.status === 'active' ? 'Ativa' : 'Rascunho'}
                        </Badge>
                      </div>
                      <Progress 
                        value={(survey.completed / survey.target) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{survey.completed} de {survey.target} entrevistas</span>
                        <span>Prazo: {new Date(survey.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Últimas ações dos entrevistadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-full">
                          <CheckCircle className="h-3 w-3 text-success" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{activity.location}</span>
                            <span>•</span>
                            <span>{activity.interviewer}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="surveys">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pesquisas</CardTitle>
                <CardDescription>
                  Crie e gerencie suas pesquisas eleitorais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Builder de Pesquisas</h3>
                  <p className="text-muted-foreground mb-6">
                    Ferramenta completa para criar formulários dinâmicos
                  </p>
                  <Button variant="electoral">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Nova Pesquisa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Coletas</CardTitle>
                <CardDescription>
                  Visualização geográfica das entrevistas realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mapa Interativo</h3>
                    <p className="text-muted-foreground">
                      Integração com Leaflet em desenvolvimento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Analíticos</CardTitle>
                <CardDescription>
                  Análises estatísticas e margem de erro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Avançado</h3>
                  <p className="text-muted-foreground mb-6">
                    Gráficos interativos com Recharts em desenvolvimento
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;