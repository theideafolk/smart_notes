import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import './editor.css';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, placeholder = 'Start writing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'm-0 p-0',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="editor-container h-[calc(100vh-300px)] overflow-y-auto">
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none min-h-full p-4"
      />
    </div>
  );
};

export default Editor;