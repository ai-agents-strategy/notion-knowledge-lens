
DROP POLICY "Users can view their own integrations" ON public.integrations;
CREATE POLICY "Users can view their own integrations" 
  ON public.integrations 
  FOR SELECT 
  USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY "Users can create their own integrations" ON public.integrations;
CREATE POLICY "Users can create their own integrations" 
  ON public.integrations 
  FOR INSERT 
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY "Users can update their own integrations" ON public.integrations;
CREATE POLICY "Users can update their own integrations" 
  ON public.integrations 
  FOR UPDATE 
  USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY "Users can delete their own integrations" ON public.integrations;
CREATE POLICY "Users can delete their own integrations" 
  ON public.integrations 
  FOR DELETE 
  USING ((auth.jwt() ->> 'sub') = user_id);
