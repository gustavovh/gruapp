-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-evidence', 'service-evidence', true);

-- 2. Enable RLS on the bucket (Policies)

-- Allow authenticated users (drivers) to upload photos
CREATE POLICY "Drivers can upload evidence" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'service-evidence');

-- Allow everyone to read the photos (public bucket)
CREATE POLICY "Public can view evidence" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'service-evidence');

-- Only admins can delete photos
CREATE POLICY "Admins can delete evidence" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'service-evidence' AND (auth.jwt() ->> 'role') = 'admin');
