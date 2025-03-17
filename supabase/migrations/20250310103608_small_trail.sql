/*
  # Storage Bucket Setup
  
  1. Purpose
    - Creates the required storage bucket for project files
    - Sets up proper security policies for the bucket
  
  2. Actions
    - Creates 'project-files' bucket if it doesn't exist
    - Configures RLS policies for file access
*/

-- First check if the bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'project-files'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-files', 'project-files', FALSE);
    
    -- Create security policies for the bucket
    
    -- Policy to allow authenticated users to insert their own files
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can upload their own files',
      'project-files',
      'INSERT',
      'bucket_id = ''project-files'' AND auth.uid() = (storage.foldername(name))[1]::uuid'
    );
    
    -- Policy to allow authenticated users to select their own files
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can view their own files',
      'project-files',
      'SELECT',
      'bucket_id = ''project-files'' AND auth.uid() = (storage.foldername(name))[1]::uuid'
    );
    
    -- Policy to allow authenticated users to update their own files
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can update their own files',
      'project-files',
      'UPDATE',
      'bucket_id = ''project-files'' AND auth.uid() = (storage.foldername(name))[1]::uuid'
    );
    
    -- Policy to allow authenticated users to delete their own files
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can delete their own files',
      'project-files',
      'DELETE',
      'bucket_id = ''project-files'' AND auth.uid() = (storage.foldername(name))[1]::uuid'
    );
  END IF;
END $$;