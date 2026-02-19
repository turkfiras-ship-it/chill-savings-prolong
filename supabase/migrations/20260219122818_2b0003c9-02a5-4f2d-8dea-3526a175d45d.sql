
CREATE TABLE public.page_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Page',
  layout_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;

-- Public read for published pages
CREATE POLICY "Published pages are publicly readable"
ON public.page_layouts FOR SELECT
USING (status = 'published');

-- Allow anyone to insert/update/delete (no auth requirement for this app)
CREATE POLICY "Anyone can manage pages"
ON public.page_layouts FOR ALL
USING (true)
WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_page_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_page_layouts_updated_at
BEFORE UPDATE ON public.page_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_page_layouts_updated_at();
