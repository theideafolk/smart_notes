/*
  # Create storage bucket for project files
  
  1. New Bucket
    - Create a storage bucket called 'project-files' for storing project files
  
  2. Security
    - Set up RLS policies to restrict access to authenticated users
    - Users can only upload/access their own files
*/

-- Create the project-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies

-- Allow authenticated users to select objects they own
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to insert objects in their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update objects they own
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete objects they own
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);