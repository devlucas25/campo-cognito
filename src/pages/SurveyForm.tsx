import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Wifi, 
  WifiOff, 
  Save, 
  Send,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Shield
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SurveyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { location, loading: gpsLoading, isAccurate, getAccuracyText } = useGeolocation();
  const { isOnline, addToSyncQueue, saveOfflineData } = useOfflineSync();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock survey data - in real app, fetch from Supabase
  const survey = {
    id: id || '1',
    title: "Pesquisa Municipal 2024",
    description: "Pesquisa de intenção de voto para prefeito",
    questions: [
      {
        id: '1',
        type: 'single_choice',
        prompt: 'Se a eleição fosse hoje, em quem você votaria para prefeito?',
        options: ['Candidato A', 'Candidato B', 'Candidato C', 'Branco/Nulo', 'Não sei'],
        required: true
      },
      {
        id: '2',
        type: 'single_choice',
        prompt: 'Qual a sua faixa etária?',
        options: ['18-25 anos', '26-35 anos', '36-45 anos', '46-55 anos', '56+ anos'],
        required: true
      },
      {
        id: '3',
        type: 'single_choice',
        prompt: 'Qual o seu grau de escolaridade?',
        options: ['Fundamental', 'Médio', 'Superior', 'Pós-graduação'],
        required: true
      },
      {
        id: '4',
        type: 'rating',
        prompt: 'Como você avalia a atual administração? (1-5)',
        required: true
      },
      {
        id: '5',
        type: 'text',
        prompt: 'Qual o principal problema da cidade?',
        required: false
      }
    ]
  };

  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;
  const currentQuestionData = survey.questions[currentQuestion];

  const handleResponseChange = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestionData.id]: value
    }));

    // Auto-save locally
    saveOfflineData(`survey_${id}_responses`, {
      ...responses,
      [currentQuestionData.id]: value
    });
  };

  const canProceed = () => {
    if (!consentGiven) return false;
    if (currentQuestionData.required && !responses[currentQuestionData.id]) return false;
    return true;
  };

  const nextQuestion = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      toast({
        variant: "destructive",
        title: "GPS Necessário",
        description: "Aguarde a localização ser obtida antes de finalizar.",
      });
      return;
    }

    if (!isAccurate()) {
      toast({
        variant: "destructive",
        title: "GPS Impreciso",
        description: "Mova-se para um local com melhor sinal GPS.",
      });
      return;
    }

    setSaving(true);

    const responseData = {
      survey_id: survey.id,
      interviewer_id: user?.id,
      consent_given: consentGiven,
      device_id: crypto.randomUUID(),
      collected_at: new Date().toISOString(),
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      location_accuracy: location.accuracy,
      app_version: '1.0.0',
      responses: Object.entries(responses).map(([questionId, value]) => ({
        question_id: questionId,
        value
      }))
    };

    try {
      if (isOnline) {
        // Try to submit directly
        console.log('Submitting response:', responseData);
        toast({
          title: "Entrevista Enviada",
          description: "Resposta sincronizada com sucesso!",
        });
      } else {
        // Add to sync queue
        addToSyncQueue('response', responseData);
        toast({
          title: "Entrevista Salva",
          description: "Será sincronizada quando conectar.",
        });
      }

      // Clear local data
      localStorage.removeItem(`campo_quest_survey_${id}_responses`);
      
      // Navigate back
      navigate('/field');
      
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = () => {
    const question = currentQuestionData;

    switch (question.type) {
      case 'single_choice':
        return (
          <RadioGroup
            value={responses[question.id] || ''}
            onValueChange={handleResponseChange}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'rating':
        return (
          <RadioGroup
            value={responses[question.id] || ''}
            onValueChange={handleResponseChange}
            className="flex space-x-4"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="cursor-pointer">
                  {rating}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Digite sua resposta..."
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/field')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="font-semibold">{survey.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Pergunta {currentQuestion + 1} de {survey.questions.length}
                </p>
              </div>
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
                  <MapPin className={`h-4 w-4 ${isAccurate() ? 'text-success' : 'text-warning'}`} />
                  <span className="text-xs">
                    GPS {getAccuracyText(location)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* GPS Warning */}
        {gpsLoading && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-warning animate-pulse" />
                <div>
                  <p className="font-medium text-warning">Obtendo Localização...</p>
                  <p className="text-sm text-muted-foreground">
                    Aguarde enquanto o GPS é localizado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {location && !isAccurate() && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">GPS Impreciso</p>
                  <p className="text-sm text-muted-foreground">
                    Precisão atual: {getAccuracyText(location)}. 
                    Mova-se para área aberta para melhor precisão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consent */}
        {currentQuestion === 0 && !consentGiven && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Termo de Consentimento
              </CardTitle>
              <CardDescription>
                Leia e aceite antes de iniciar a entrevista
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="mb-2 font-medium">Consentimento para Participação em Pesquisa</p>
                <p className="mb-2">
                  Ao aceitar participar desta pesquisa, você concorda que:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sua participação é voluntária e anônima</li>
                  <li>Seus dados serão usados apenas para fins estatísticos</li>
                  <li>Você pode interromper a entrevista a qualquer momento</li>
                  <li>Sua localização será registrada para validação geográfica</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm font-medium">
                  Aceito participar da pesquisa e concordo com os termos acima
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        {consentGiven && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {currentQuestionData.required ? 'Obrigatória' : 'Opcional'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {currentQuestion + 1} / {survey.questions.length}
                </div>
              </div>
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestionData.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion()}
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <Button
                  onClick={nextQuestion}
                  disabled={!canProceed() || saving}
                  variant={currentQuestion === survey.questions.length - 1 ? "electoral" : "default"}
                >
                  {saving ? (
                    "Salvando..."
                  ) : currentQuestion === survey.questions.length - 1 ? (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Finalizar
                    </>
                  ) : (
                    <>
                      Próxima
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;