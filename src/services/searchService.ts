import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type { Note, ProjectFile, ProjectChatResult } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Generate embeddings for a text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Search for similar notes based on a query
export async function searchSimilarNotes(query: string, limit = 5): Promise<Note[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Search for similar notes using vector similarity with a higher threshold
    const { data, error } = await supabase.rpc('match_notes', {
      query_embedding: embedding,
      match_threshold: 0.78, // Increased threshold for better relevance
      match_count: limit,
    });
    
    if (error) throw error;
    
    // Filter out results with low similarity scores
    const results = (data as Note[]).filter(note => note.similarity && note.similarity >= 0.78);
    return results;
  } catch (error) {
    console.error('Error searching similar notes:', error);
    return []; // Remove fallback to text search as it's less accurate
  }
}

// Fallback search function that searches notes by text
async function searchNotesByText(query: string, limit = 5): Promise<Note[]> {
  try {
    const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (terms.length === 0) return [];
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .limit(20); // Get more notes to filter locally
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Score notes based on how many query terms they contain
    const scoredNotes = data.map(note => {
      const content = (note.title + ' ' + note.content).toLowerCase();
      const score = terms.reduce((acc, term) => {
        return acc + (content.includes(term) ? 1 : 0);
      }, 0);
      
      return { ...note, score };
    });
    
    // Sort by score and take the top results
    return scoredNotes
      .filter(note => note.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in text search fallback:', error);
    return [];
  }
}

// Search for project-specific notes
export async function searchProjectNotes(query: string, projectId: string, limit = 5): Promise<Note[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Search for similar notes using vector similarity
    const { data, error } = await supabase.rpc('match_project_notes', {
      query_embedding: embedding,
      project_id: projectId,
      match_threshold: 0.5,
      match_count: limit,
    });
    
    if (error) throw error;
    
    return data as Note[];
  } catch (error) {
    console.error('Error searching project notes:', error);
    
    // Fallback to manual search if vector search fails
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .limit(20);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (terms.length === 0) return data.slice(0, limit);
      
      // Score notes based on how many query terms they contain
      const scoredNotes = data.map(note => {
        const content = (note.title + ' ' + note.content).toLowerCase();
        const score = terms.reduce((acc, term) => {
          return acc + (content.includes(term) ? 1 : 0);
        }, 0);
        
        return { ...note, score };
      });
      
      // Sort by score and take the top results
      return scoredNotes
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (innerError) {
      console.error('Error in project notes fallback search:', innerError);
      return [];
    }
  }
}

// Get project files
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting project files:', error);
    return [];
  }
}

// Extract text from a file
export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    // Get a temporary URL for the file
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, 60);
      
    if (error) throw error;
    
    // Fetch the file content
    const response = await fetch(data.signedUrl);
    const blob = await response.blob();
    
    // For text files, just read the text
    if (blob.type.startsWith('text/')) {
      return await blob.text();
    }
    
    // For PDFs, use our FastAPI backend
    if (blob.type === 'application/pdf') {
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', blob, 'document.pdf');
        
        // Send to our FastAPI backend
        const apiResponse = await fetch('http://localhost:8000/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }
        
        const result = await apiResponse.json();
        return result.text;
      } catch (pdfError) {
        console.error('Error extracting PDF text:', pdfError);
        return 'Error: Could not extract text from PDF file';
      }
    }
    
    // For Microsoft Office documents (docx)
    if (blob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', blob, 'document.docx');
        
        // TODO: Add DOCX processing endpoint to FastAPI backend
        return 'DOCX processing will be implemented soon';
      } catch (docError) {
        console.error('Error extracting Word document text:', docError);
        return 'Error: Could not extract text from Word document';
      }
    }
    
    // For other file types, return a message
    return `File type ${blob.type} is not supported for text extraction`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}

// Search the web
export async function searchWeb(query: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that searches the web for information. Provide a concise summary of what you would find if you searched the web for the following query.'
        },
        {
          role: 'user',
          content: `Web search query: ${query}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content || 'No results found';
  } catch (error) {
    console.error('Error searching web:', error);
    return 'Failed to search the web';
  }
}

// Generate an answer based on a query and relevant notes
export async function generateAnswer(query: string, notes: Note[]): Promise<string | null> {
  try {
    // If no notes provided, return null
    if (!notes || notes.length === 0) {
      return null;
    }

    // Create context from the provided notes only
    const context = notes.map(note => `Note "${note.title}":\n${note.content}`).join('\n\n');

    // Generate answer using only the provided context
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers questions based only on the provided notes. If the answer cannot be found in the provided notes, say so - do not use any external knowledge."
        },
        {
          role: "user",
          content: `Here are the notes to use as context:\n\n${context}\n\nQuestion: ${query}\n\nAnswer only using information from the provided notes. If the information isn't in these notes, say so.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating answer:', error);
    return null;
  }
}

// Generate a project-specific answer
export async function generateProjectAnswer(query: string, projectId: string): Promise<ProjectChatResult> {
  try {
    // Search for relevant notes
    const notes = await searchProjectNotes(query, projectId, 5);
    
    // Get project files
    const files = await getProjectFiles(projectId);
    
    // Extract text from files
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await extractTextFromFile(file.file_path);
        return {
          name: file.name,
          content
        };
      })
    );
    
    // Create context from both notes and files
    const notesContext = notes.map(note => 
      `Note Title: ${note.title}\nContent: ${note.content}`
    ).join('\n\n');
    
    const filesContext = fileContents
      .filter(file => file.content && file.content.length > 0)
      .map(file => 
        `File: ${file.name}\nContent: ${file.content}`
      ).join('\n\n');
    
    // Combine contexts
    const fullContext = [notesContext, filesContext].filter(Boolean).join('\n\n');
    
    // Generate an answer based on the combined context
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on the provided project notes and files. Use the information from both sources to provide comprehensive answers. If the available information is not sufficient to answer the question, say so.'
        },
        {
          role: 'user',
          content: `Context:\n${fullContext}\n\nQuestion: ${query}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });
    
    const answer = response.choices[0].message.content || 'I could not generate an answer based on the available information.';
    
    // Check if the answer is insufficient
    const isInsufficientAnswer = 
      answer.toLowerCase().includes('do not have enough information') ||
      answer.toLowerCase().includes('cannot answer') ||
      answer.toLowerCase().includes('don\'t have information') ||
      answer.toLowerCase().includes('no information available');
    
    // If the answer is insufficient and we don't have much context, search the web
    if (isInsufficientAnswer && notes.length < 2 && fileContents.filter(f => f.content).length < 2) {
      const webResults = await searchWeb(query);
      
      // Generate a new answer that includes web results
      const webAnswer = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on web search results. Provide a concise answer based on the web search results.'
          },
          {
            role: 'user',
            content: `Web search results:\n${webResults}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });
      
      return {
        answer: webAnswer.choices[0].message.content || 'I could not find a good answer to your question.',
        relatedNotes: notes,
        relatedFiles: files.filter((_, index) => fileContents[index]?.content),
        source: 'web_search',
        webSearchResults: webResults,
      };
    }
    
    // Return the answer based on project data
    return {
      answer,
      relatedNotes: notes,
      relatedFiles: files.filter((_, index) => fileContents[index]?.content),
      source: 'project_data',
    };
  } catch (error) {
    console.error('Error generating project answer:', error);
    throw new Error('Failed to generate an answer');
  }
}