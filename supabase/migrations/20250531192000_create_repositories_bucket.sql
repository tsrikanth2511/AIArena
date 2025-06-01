-- Create a new storage bucket for repositories if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'repositories', 'repositories', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'repositories'
);

-- Set up storage policies
CREATE POLICY "Users can upload their own repositories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'repositories');

CREATE POLICY "Users can read their own repositories"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'repositories');

CREATE POLICY "Users can delete their own repositories"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'repositories'); 