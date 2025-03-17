import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, Editor as TipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { ChevronDown, Type, Settings } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Font families and sizes for the dropdown
const fontFamilies = [
  { name: 'Default', value: 'Inter, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Monospace', value: 'JetBrains Mono, monospace' },
];

const fontSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Normal', value: '16px' },
  { name: 'Medium', value: '18px' },
  { name: 'Large', value: '20px' },
];

export default function Editor({ content, onChange, placeholder }: EditorProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentFontFamily, setCurrentFontFamily] = useState(fontFamilies[0]);
  const [currentFontSize, setCurrentFontSize] = useState(fontSizes[1]);
  const [editorKey, setEditorKey] = useState(Date.now()); // Force re-render when needed

  // Create editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none p-4',
        style: `font-family: ${currentFontFamily.value}; font-size: ${currentFontSize.value}; min-height: 200px;`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor when content changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editor when font settings change
  useEffect(() => {
    if (editor) {
      const element = editor.view.dom as HTMLElement;
      if (element) {
        element.style.fontFamily = currentFontFamily.value;
        element.style.fontSize = currentFontSize.value;
      }
    }
  }, [currentFontFamily, currentFontSize, editor]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Focus editor when clicked outside of toolbar
  const handleContainerClick = (e: React.MouseEvent) => {
    if (editor && e.target === e.currentTarget) {
      editor.commands.focus();
    }
  };

  // Handle font family change
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setCurrentFontFamily(fontFamilies[index]);
  };

  // Handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setCurrentFontSize(fontSizes[index]);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center">
          <Type className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Editor</span>
        </div>
        <button
          onClick={toggleSettings}
          type="button"
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Font settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Settings panel - only shown when settings are open */}
      {showSettings && (
        <div className="bg-gray-50 border-b border-gray-200 p-3">
          <div className="flex flex-wrap gap-3">
            {/* Font family dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">Font Family</label>
              <div className="relative">
                <select
                  value={fontFamilies.findIndex(f => f.value === currentFontFamily.value)}
                  onChange={handleFontFamilyChange}
                  className="block w-full pl-3 pr-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
                  style={{ fontFamily: currentFontFamily.value }}
                >
                  {fontFamilies.map((font, index) => (
                    <option key={font.name} value={index} style={{ fontFamily: font.value }}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Font size dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">Font Size</label>
              <div className="relative">
                <select
                  value={fontSizes.findIndex(s => s.value === currentFontSize.value)}
                  onChange={handleFontSizeChange}
                  className="block w-full pl-3 pr-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
                >
                  {fontSizes.map((size, index) => (
                    <option key={size.name} value={index}>
                      {size.name} ({size.value})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor content area */}
      <div
        className="overflow-auto"
        style={{ maxHeight: "400px" }}
        onClick={handleContainerClick}
      >
        {editor ? (
          <EditorContent editor={editor} key={editorKey} />
        ) : (
          <div className="p-4 text-gray-400">Loading editor...</div>
        )}
      </div>
    </div>
  );
}