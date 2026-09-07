CREATE TABLE public.protokolai (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data date,
  gavimo_data date,
  psp text,
  tipas text,
  tyrejas text,
  padalinys text,
  postas text,
  pareigunas text,
  pazymejimas text,
  siuntos_nr text,
  ikiteism_nr text,
  ikiteisminis_prad date,
  pastabos text,
  byla_baigta boolean NOT NULL DEFAULT false,
  bylos_baigimo_data date,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protokolai TO authenticated;
GRANT ALL ON public.protokolai TO service_role;

ALTER TABLE public.protokolai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view records" ON public.protokolai FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert records" ON public.protokolai FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update records" ON public.protokolai FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete records" ON public.protokolai FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_protokolai_updated_at
BEFORE UPDATE ON public.protokolai
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
