import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '../extensions/FontSize';
import './editor.css';

interface EditorProps {
  content: string;
  title: string;
  onChangeContent: (content: string) => void;
  onChangeTitle: (title: string) => void;
  placeholder?: string;
}

const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];

const fontFamilies = [
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
];

const Editor: React.FC<EditorProps> = ({ 
  content, 
  title,
  onChangeContent, 
  onChangeTitle,
  placeholder = 'Capture your thoughts and ideas' 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChangeContent(editor.getHTML());
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="h-full bg-white flex flex-col min-h-full">
      <div className="flex-1 px-16 py-12 flex flex-col min-h-full">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Add note title"
          className="w-full text-4xl font-bold text-gray-800 mb-8 bg-transparent border-none outline-none placeholder-gray-300"
        />
        
        {/* Content Editor */}
        <div className="editor-content flex-1 flex flex-col min-h-[calc(100vh-12rem)]">
          {editor && (
            <BubbleMenu 
              editor={editor} 
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-2 py-1 px-2 bg-white rounded shadow-lg border border-gray-200"
            >
              {/* Font Family Dropdown */}
              <select
                className="text-sm h-8 px-2 rounded border border-gray-200 focus:outline-none min-w-[120px] bg-white"
                onChange={(e) => {
                  const font = e.target.value;
                  editor.chain()
                    .focus()
                    .setFontFamily(font)
                    .run();
                }}
                value={editor.getAttributes('textStyle').fontFamily || fontFamilies[0].value}
              >
                {fontFamilies.map((font) => (
                  <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>

              {/* Font Size Dropdown */}
              <select
                className="text-sm h-8 w-16 px-1 rounded border border-gray-200 focus:outline-none bg-white"
                onChange={(e) => {
                  const size = e.target.value;
                  editor.chain()
                    .focus()
                    .setFontSize(`${size}px`)
                    .run();
                }}
                value={(editor.getAttributes('textStyle').fontSize || '18px').replace('px', '')}
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              {/* Formatting Buttons */}
              <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${
                    editor.isActive('bold') ? 'bg-gray-100' : ''
                  }`}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${
                    editor.isActive('italic') ? 'bg-gray-100' : ''
                  }`}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
              </div>
            </BubbleMenu>
          )}
      <EditorContent 
        editor={editor} 
            className="prose prose-lg max-w-none flex-1 min-h-full"
      />
        </div>
      </div>
    </div>
  );
};

export default Editor;