-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Criar tipos enum
CREATE TYPE public.app_role AS ENUM ('admin', 'interviewer');
CREATE TYPE public.survey_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE public.question_type AS ENUM ('single_choice', 'multiple_choice', 'text', 'number', 'date', 'rating');
CREATE TYPE public.message_type AS ENUM ('text', 'system', 'alert');

-- Tabela de organizações (multilocação)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  role public.app_role NOT NULL DEFAULT 'interviewer',
  full_name TEXT NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pesquisas
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_city VARCHAR NOT NULL,
  target_neighborhoods VARCHAR[],
  target_interviews INTEGER NOT NULL DEFAULT 100,
  deadline DATE,
  status public.survey_status DEFAULT 'draft',
  margin_of_error NUMERIC(4,2),
  confidence_level INTEGER DEFAULT 95,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perguntas
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  type public.question_type NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  validation_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atribuições
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_neighborhoods VARCHAR[],
  quota_target INTEGER DEFAULT 0,
  quota_completed INTEGER DEFAULT 0,
  target_area JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_id, interviewer_id)
);

-- Tabela de respostas coletadas
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  device_id TEXT,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location GEOGRAPHY(POINT, 4326),
  location_accuracy NUMERIC,
  app_version TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas individuais
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens (chat)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id),
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  message_type public.message_type DEFAULT 'text',
  read_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Função helper para pegar org_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_org_id() 
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Função helper para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role() 
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all org profiles" ON public.profiles
  FOR SELECT USING (
    org_id = public.get_user_org_id() AND 
    public.get_user_role() = 'admin'
  );

-- Políticas RLS para organizations
CREATE POLICY "Users see own organization" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id());

-- Políticas RLS para surveys
CREATE POLICY "Users see own org surveys" ON public.surveys
  FOR ALL USING (org_id = public.get_user_org_id());

-- Políticas RLS para questions
CREATE POLICY "Users see own org questions" ON public.questions
  FOR ALL USING (
    survey_id IN (
      SELECT id FROM public.surveys WHERE org_id = public.get_user_org_id()
    )
  );

-- Políticas RLS para assignments
CREATE POLICY "Interviewers see own assignments" ON public.assignments
  FOR SELECT USING (
    interviewer_id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Admins manage assignments" ON public.assignments
  FOR ALL USING (
    survey_id IN (
      SELECT id FROM public.surveys WHERE org_id = public.get_user_org_id()
    ) AND public.get_user_role() = 'admin'
  );

-- Políticas RLS para responses
CREATE POLICY "Interviewers see own responses" ON public.responses
  FOR SELECT USING (
    interviewer_id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Interviewers insert own responses" ON public.responses
  FOR INSERT WITH CHECK (
    interviewer_id = auth.uid() AND 
    org_id = public.get_user_org_id()
  );

CREATE POLICY "Admins see all org responses" ON public.responses
  FOR ALL USING (
    org_id = public.get_user_org_id() AND 
    public.get_user_role() = 'admin'
  );

-- Políticas RLS para answers
CREATE POLICY "Users see own org answers" ON public.answers
  FOR ALL USING (
    response_id IN (
      SELECT id FROM public.responses WHERE org_id = public.get_user_org_id()
    )
  );

-- Políticas RLS para messages
CREATE POLICY "Users see own messages" ON public.messages
  FOR ALL USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    public.get_user_role() = 'admin'
  );

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Buscar ou criar organização padrão
  SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-org' LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug) 
    VALUES ('Organização Padrão', 'default-org') 
    RETURNING id INTO default_org_id;
  END IF;
  
  -- Criar perfil
  INSERT INTO public.profiles (id, org_id, full_name, role)
  VALUES (
    NEW.id, 
    default_org_id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::public.app_role
      ELSE 'interviewer'::public.app_role
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.organizations (name, slug) VALUES ('Campo Quest Demo', 'campo-quest-demo');

-- Função para calcular margem de erro
CREATE OR REPLACE FUNCTION public.calculate_margin_of_error(sample_size INTEGER, confidence_level INTEGER DEFAULT 95)
RETURNS NUMERIC AS $$
DECLARE
  z_score NUMERIC;
  margin NUMERIC;
BEGIN
  -- Z-scores para níveis de confiança comuns
  CASE confidence_level
    WHEN 90 THEN z_score := 1.645;
    WHEN 95 THEN z_score := 1.96;
    WHEN 99 THEN z_score := 2.576;
    ELSE z_score := 1.96; -- Default para 95%
  END CASE;
  
  -- Fórmula: ME = Z × √(p × (1-p) / n), assumindo p = 0.5 para máxima variabilidade
  margin := z_score * sqrt(0.25 / sample_size) * 100;
  
  RETURN ROUND(margin, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;