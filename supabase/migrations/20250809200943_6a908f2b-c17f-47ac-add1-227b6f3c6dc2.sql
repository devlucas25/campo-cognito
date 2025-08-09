-- Corrigir problemas de segurança: adicionar search_path nas funções

-- Recriar função get_user_org_id com search_path
CREATE OR REPLACE FUNCTION public.get_user_org_id() 
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Recriar função get_user_role com search_path
CREATE OR REPLACE FUNCTION public.get_user_role() 
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Recriar função handle_new_user com search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Recriar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Recriar função calculate_margin_of_error com search_path
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
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp;