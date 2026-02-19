
-- Fix RLS: current setup has only RESTRICTIVE policies (no permissive = nothing accessible)
-- Drop existing restrictive-only policies
DROP POLICY IF EXISTS "Anyone can manage pages" ON public.page_layouts;
DROP POLICY IF EXISTS "Published pages are publicly readable" ON public.page_layouts;

-- Add a permissive policy for public access (internal tool, no auth required)
CREATE POLICY "Allow public access to page layouts"
ON public.page_layouts
FOR ALL
USING (true)
WITH CHECK (true);

-- Add unique constraint on name so we can upsert by name
ALTER TABLE public.page_layouts ADD CONSTRAINT page_layouts_name_unique UNIQUE (name);
