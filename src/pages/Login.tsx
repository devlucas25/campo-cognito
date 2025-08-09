import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Users, BarChart3 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, redirect based on email
    if (email.includes("admin")) {
      window.location.href = "/admin";
    } else {
      window.location.href = "/field";
    }
    
    setIsLoading(false);
  };

  const features = [
    { icon: Shield, title: "Segurança LGPD", desc: "Conformidade total com proteção de dados" },
    { icon: Users, title: "Multiusuário", desc: "Gestão completa de administradores e entrevistadores" },
    { icon: BarChart3, title: "Analytics Avançado", desc: "Relatórios profissionais e margem de erro" },
    { icon: CheckCircle, title: "Modo Offline", desc: "Coleta em campo sem internet" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              Sistema Profissional v2.0
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Campo Quest
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              Plataforma completa para pesquisas eleitorais em campo com tecnologia offline-first
            </p>
          </div>

          <div className="grid gap-4 max-w-md">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <feature.icon className="h-5 w-5 text-accent shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{feature.title}</div>
                  <div className="text-sm text-white/70">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-electoral bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-center">
                Faça login para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="electoral"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Autenticando..." : "Entrar"}
                </Button>
              </form>
              
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <div className="text-center">Contas demo:</div>
                <div className="grid gap-1 text-xs">
                  <div>• admin@demo.com - Administrador</div>
                  <div>• campo@demo.com - Entrevistador</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;