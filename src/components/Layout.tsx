import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  BarChart2,
  Settings as SettingsIcon,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Folder as FolderIcon,
  Plus,
  FilePlus,
  FolderPlus,
  Copy,
  Scissors,
  Edit,
  Trash,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { useChatStore } from '../store/chatStore';
import { useSidebarStore } from '../store/sidebarStore';
import { useAuthStore } from '../store/authStore';
import { useFolderStore, type Folder } from '../store/folderStore';
import AvatarSelector from './AvatarSelector';

// Define the recursive folder type
type FolderWithChildren = Folder & {
  children: FolderWithChildren[];
};

// Add clipboard type definition
type ClipboardItem = {
  type: 'folder' | 'note';
  id: string;
  name: string;
  action: 'copy' | 'cut';
} | null;

const navItems = [
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/folders', icon: FolderIcon, label: 'Folders', hasAddButton: true },
  { path: '/chatbot', icon: MessageSquare, label: 'Chatbot' },
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notes, fetchNotes, deleteNote, moveNote, copyNote } = useNoteStore();
  const { sessions, fetchSessions, setCurrentSession } = useChatStore();
  const { isOpen, toggle } = useSidebarStore();
  const { userProfile, signOut, updateUserProfile } = useAuthStore();
  const { folders, fetchFolders, createFolder, updateFolder, setFolderEditing, selectedFolderId, setSelectedFolder, deleteFolder, moveFolder, copyFolder } = useFolderStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [newFolderInputRef, setNewFolderInputRef] = useState<HTMLInputElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = 16rem (w-64)
  const [isResizing, setIsResizing] = useState(false);
  const minWidth = 200; // Minimum sidebar width
  const maxWidth = 600; // Maximum sidebar width
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    notes: true,
    folders: true,
    chatbot: true
  });
  const [collapsedFolders, setCollapsedFolders] = useState<{ [key: string]: boolean }>({});
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    folderId: string;
    folderName: string;
    isVisible: boolean;
  }>({
    x: 0,
    y: 0,
    folderId: '',
    folderName: '',
    isVisible: false
  });
  const [sectionContextMenu, setSectionContextMenu] = useState<{
    x: number;
    y: number;
    section: string;
    isVisible: boolean;
  }>({
    x: 0,
    y: 0,
    section: '',
    isVisible: false
  });

  // Add clipboard state
  const [clipboard, setClipboard] = useState<ClipboardItem>(null);

  // Add note context menu state
  const [noteContextMenu, setNoteContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
    noteTitle: string;
    isVisible: boolean;
  }>({
    x: 0,
    y: 0,
    noteId: '',
    noteTitle: '',
    isVisible: false
  });

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const isViewingExistingNote = location.pathname === '/notes' && searchParams.get('id') !== null;

  useEffect(() => {
    fetchNotes();
    fetchSessions();
    fetchFolders();
  }, [fetchNotes, fetchSessions, fetchFolders]);

  // Add effect to handle auto-selection of text
  useEffect(() => {
    if (newFolderInputRef) {
      newFolderInputRef.focus();
      newFolderInputRef.select();
    }
  }, [newFolderInputRef]);

  const handleCreateFolder = async () => {
    try {
      const newFolder = await createFolder('New Folder');
      if (newFolder) {
        setEditingFolder({ id: newFolder.id, name: 'New Folder' });
        setFolderEditing(newFolder.id, true);
      }
      navigate('/folders');
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleUpdateFolder = async (folderId: string) => {
    if (!editingFolder) return;
    try {
      await updateFolder(folderId, editingFolder.name);
      setEditingFolder(null);
      setSelectedFolder(folderId);
    } catch (error) {
      console.error('Error updating folder:', error);
      alert('Failed to update folder. Please try again.');
    }
  };

  const handleCancelEdit = (folderId: string) => {
    setFolderEditing(folderId, false);
    setEditingFolder(null);
    setSelectedFolder(null);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        // After successful deletion, navigate to /notes if we're viewing the deleted note
        const currentNoteId = new URLSearchParams(location.search).get('id');
        if (currentNoteId === id) {
          navigate('/notes');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleChatbotClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/chatbot');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-section')) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  const handleAvatarSelect = async (avatar: string) => {
    try {
      await updateUserProfile({ avatar });
      setShowAvatarSelector(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.isVisible) {
        const target = event.target as HTMLElement;
        // Check if the click is on the context menu or its children
        if (!target.closest('.context-menu')) {
          setContextMenu(prev => ({ ...prev, isVisible: false }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.isVisible]);

  const handleFolderContextMenu = (e: React.MouseEvent, folder: FolderWithChildren) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId: folder.id,
      folderName: folder.name,
      isVisible: true
    });
  };

  const handleNewNote = (folderId: string) => {
    // Clear any existing note ID from the URL and add the folderId
    const newPath = `/notes?folderId=${folderId}`;
    navigate(newPath, { replace: true });
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handleNewFolder = async (parentId: string | null = null) => {
    try {
      const newFolder = await createFolder('New Folder', parentId);
      if (newFolder) {
        setEditingFolder({ id: newFolder.id, name: 'New Folder' });
        setFolderEditing(newFolder.id, true);
      }
      setContextMenu(prev => ({ ...prev, isVisible: false }));
      navigate('/folders');
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleCopyFolder = (folderId: string, folderName: string) => {
    setClipboard({
      type: 'folder',
      id: folderId,
      name: folderName,
      action: 'copy'
    });
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handleCutFolder = (folderId: string, folderName: string) => {
    setClipboard({
      type: 'folder',
      id: folderId,
      name: folderName,
      action: 'cut'
    });
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setEditingFolder({ id: folder.id, name: folder.name });
      setFolderEditing(folderId, true);
      setContextMenu(prev => ({ ...prev, isVisible: false }));
    }
  };

  const handleDeleteFolderFromContext = async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await deleteFolder(folderId);
        setContextMenu(prev => ({ ...prev, isVisible: false }));
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder. Please try again.');
      }
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && isOpen) {
      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Add this helper function to organize folders into a tree structure
  const buildFolderTree = (folders: Folder[]): FolderWithChildren[] => {
    const folderMap = new Map<string, FolderWithChildren>();
    const rootFolders: FolderWithChildren[] = [];

    // First, create a map of all folders with empty children arrays
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Then, organize folders into parent-child relationships
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        const parent = folderMap.get(folder.parent_id)!;
        parent.children.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  };

  // Add this component to recursively render the folder tree
  const FolderTreeItem = ({ folder, level = 0 }: { folder: FolderWithChildren, level: number }) => {
    const hasNotes = notes.filter(note => note.folder_id === folder.id).length > 0;
    const isFolderCollapsed = collapsedFolders[folder.id];
    const hasChildren = folder.children.length > 0;
    const isEditing = editingFolder?.id === folder.id;
    
    return (
      <div key={folder.id} style={{ marginLeft: `${level * 12}px` }}>
        <div
          className={`group relative py-2 px-4 hover:bg-gray-50 ${
            selectedFolderId === folder.id ? 'bg-primary/5' : ''
          }`}
          onContextMenu={(e) => handleFolderContextMenu(e, folder)}
        >
          <div className="flex items-center gap-1">
            <div className="w-5 flex items-center">
              {(hasNotes || hasChildren) && (
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isFolderCollapsed ? 'rotate-0' : 'rotate-90'}`} />
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full text-sm bg-transparent border-b border-gray-300 px-0 py-1 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter folder name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateFolder(folder.id);
                    } else if (e.key === 'Escape') {
                      handleCancelEdit(folder.id);
                    }
                  }}
                  onBlur={() => {
                    if (editingFolder.name.trim()) {
                      handleUpdateFolder(folder.id);
                    } else {
                      handleCancelEdit(folder.id);
                    }
                  }}
                />
              </div>
            ) : (
              <Link
                to={`/folders?id=${folder.id}`}
                onClick={() => setSelectedFolder(folder.id)}
                className={`block text-sm text-gray-600 hover:text-primary truncate pr-4 ${
                  selectedFolderId === folder.id ? 'text-primary' : ''
                }`}
              >
                {folder.name}
              </Link>
            )}
          </div>
        </div>

        {/* Display notes and subfolders when not collapsed */}
        {!isFolderCollapsed && (
          <>
            {/* Display notes under the folder */}
            {hasNotes && (
              <div className="ml-8 border-l border-gray-200">
                {notes.filter(note => note.folder_id === folder.id).map((note) => (
                  <div
                    key={note.id}
                    className="group relative py-2 px-4 hover:bg-gray-50 flex items-center gap-2"
                    onContextMenu={(e) => handleNoteContextMenu(e, { id: note.id, title: note.title })}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <Link
                      to={`/notes?id=${note.id}`}
                      className="block text-sm text-gray-600 hover:text-primary truncate pr-16"
                    >
                      {note.title}
                    </Link>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteNote(note.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recursively render child folders */}
            {hasChildren && folder.children.map(childFolder => (
              <FolderTreeItem key={childFolder.id} folder={childFolder} level={level + 1} />
            ))}
          </>
        )}
      </div>
    );
  };

  const handleSectionContextMenu = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    console.log('Opening section context menu:', { section, clipboard });
    setSectionContextMenu({
      x: e.clientX,
      y: e.clientY,
      section,
      isVisible: true
    });
  };

  // Add effect to close section context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionContextMenu.isVisible) {
        const target = event.target as HTMLElement;
        if (!target.closest('.section-context-menu')) {
          setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sectionContextMenu.isVisible]);

  // Add handlers for note operations
  const handleNoteContextMenu = (e: React.MouseEvent, note: { id: string; title: string }) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up
    console.log('Opening note context menu:', note);
    setNoteContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId: note.id,
      noteTitle: note.title,
      isVisible: true
    });
  };

  // Add useEffect to monitor clipboard changes
  useEffect(() => {
    console.log('Clipboard state changed:', clipboard);
  }, [clipboard]);

  const handleCopyNote = (noteId: string, noteTitle: string) => {
    console.log('Before copying - Current clipboard:', clipboard);
    const newClipboard = {
      type: 'note' as const,
      id: noteId,
      name: noteTitle,
      action: 'copy' as const
    };
    console.log('Setting new clipboard:', newClipboard);
    setClipboard(newClipboard);
    // Add a small delay before closing the menu
    setTimeout(() => {
      setNoteContextMenu(prev => ({ ...prev, isVisible: false }));
    }, 100);
  };

  const handleCutNote = (noteId: string, noteTitle: string) => {
    setClipboard({
      type: 'note',
      id: noteId,
      name: noteTitle,
      action: 'cut'
    });
    setNoteContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handlePaste = async (targetFolderId?: string) => {
    if (!clipboard) return;

    try {
      if (clipboard.type === 'note') {
        if (clipboard.action === 'cut') {
          await moveNote(clipboard.id, targetFolderId || null);
        } else {
          await copyNote(clipboard.id, targetFolderId || null);
        }
      } else if (clipboard.type === 'folder') {
        if (clipboard.action === 'cut') {
          await moveFolder(clipboard.id, targetFolderId || null);
        } else {
          await copyFolder(clipboard.id, targetFolderId || null);
        }
      }

      // Clear clipboard if it was a cut operation
      if (clipboard.action === 'cut') {
        setClipboard(null);
      }
    } catch (error) {
      console.error('Error pasting item:', error);
      alert('Failed to paste item. Please try again.');
    }

    // Close all context menus
    setContextMenu(prev => ({ ...prev, isVisible: false }));
    setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
    setNoteContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  // Update the click outside handler for note context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noteContextMenu.isVisible) {
        const target = event.target as HTMLElement;
        // Only close if clicking outside both the note context menu and the note itself
        if (!target.closest('.note-context-menu') && !target.closest('.note-item')) {
          console.log('Clicking outside note context menu');
          setNoteContextMenu(prev => ({ ...prev, isVisible: false }));
        }
      }
    };

    // Add a small delay before adding the click outside listener
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [noteContextMenu.isVisible]);

  // Update the note rendering in the Notes section
  const renderNote = (note: any) => (
    <div
      key={note.id}
      className="group relative py-2 px-4 hover:bg-gray-50 flex items-center gap-2 note-item"
      onContextMenu={(e) => {
        console.log('Note right-clicked:', note);
        handleNoteContextMenu(e, { id: note.id, title: note.title });
      }}
    >
      <Link
        to={`/notes?id=${note.id}`}
        className="block text-sm text-gray-600 hover:text-primary truncate pr-16"
      >
        {note.title}
      </Link>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleDeleteNote(note.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside 
        style={{ width: isOpen ? `${sidebarWidth}px` : '0' }}
        className={`
          bg-white border-r border-gray-200 flex flex-col transition-all duration-300
          ${!isOpen && 'overflow-hidden'}
        `}
      >
        {/* Fixed header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-primary">SmartNotes</span>
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PanelLeftClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Scrollable navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const sectionKey = item.label.toLowerCase();
              const isCollapsed = collapsedSections[sectionKey];
              
              return (
                <div key={item.path}>
                  <div 
                    className="flex items-center justify-between px-6 py-3"
                    onContextMenu={(e) => handleSectionContextMenu(e, item.label)}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSection(sectionKey)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} />
                      </button>
                      <Link
                        to={item.path}
                        onClick={item.label === 'Chatbot' ? handleChatbotClick : undefined}
                        className={`flex items-center gap-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </div>
                    {item.hasAddButton && !isCollapsed && (
                      <button
                        onClick={handleCreateFolder}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Display notes under Notes menu item */}
                  {item.label === 'Notes' && !isCollapsed && (
                    <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-3">
                      {notes.filter(note => !note.folder_id).map(renderNote)}
                    </div>
                  )}

                  {/* Display folders under Folders menu item */}
                  {item.label === 'Folders' && !isCollapsed && (
                    <div className="ml-4 mt-2 border-l-2 border-gray-100 pl-2">
                      {buildFolderTree(folders).map((folder) => (
                        <FolderTreeItem key={folder.id} folder={folder} level={0} />
                      ))}
                    </div>
                  )}

                  {/* Display chat sessions under Chatbot menu item */}
                  {item.label === 'Chatbot' && !isCollapsed && (
                    <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="group relative py-2 px-4 hover:bg-gray-50"
                        >
                          <Link
                            to={`/chatbot?session=${session.id}`}
                            className="block w-full text-left text-sm text-gray-600 hover:text-primary truncate pr-4"
                          >
                            {session.title}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="border-t border-gray-100 p-4 profile-section">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center w-full gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-primary transition-colors">
                <img
                  src={userProfile?.avatar ? `/${userProfile.avatar}` : '/profile_10015478.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">
                  {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {userProfile?.email || ''}
                </div>
              </div>
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => {
                    setShowAvatarSelector(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Change Avatar
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {/* Avatar Selector */}
            <AvatarSelector
              isOpen={showAvatarSelector}
              onClose={() => setShowAvatarSelector(false)}
              onSelect={handleAvatarSelect}
              currentAvatar={userProfile?.avatar || null}
            />
          </div>
        </div>
      </aside>

      {/* Resize Handle */}
      {isOpen && (
        <div
          className="w-1 hover:w-2 bg-transparent hover:bg-gray-200 cursor-col-resize transition-all duration-300 relative"
          onMouseDown={startResizing}
        >
          <div className="absolute inset-y-0 -left-2 right-0" />
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-auto relative transition-all duration-300 ${isRightPanelOpen && isViewingExistingNote ? 'mr-80' : ''}`}>
        {/* Small toggle button that's only visible when sidebar is closed */}
        {!isOpen && (
          <button
            onClick={toggle}
            className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <Outlet context={{ isRightPanelOpen: isViewingExistingNote && isRightPanelOpen, setIsRightPanelOpen }} />
      </main>

      {/* Right Panel Toggle Button - Only show when viewing an existing note */}
      {isViewingExistingNote && (
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="fixed top-4 right-4 z-30 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="w-5 h-5 text-gray-600" />
          ) : (
            <PanelRightOpen className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Context Menu */}
      {contextMenu.isVisible && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg py-2 min-w-[160px] context-menu"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => handleNewNote(contextMenu.folderId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            New Note
          </button>
          <button
            onClick={() => handleNewFolder(contextMenu.folderId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => handleCopyFolder(contextMenu.folderId, contextMenu.folderName)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={() => handleCutFolder(contextMenu.folderId, contextMenu.folderName)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            Cut
          </button>
          {clipboard && (
            <button
              onClick={() => handlePaste(contextMenu.folderId)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              Paste {clipboard.type === 'folder' ? 'Folder' : 'Note'}
            </button>
          )}
          <button
            onClick={() => handleRenameFolder(contextMenu.folderId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={() => handleDeleteFolderFromContext(contextMenu.folderId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Section Context Menu */}
      {sectionContextMenu.isVisible && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg py-2 min-w-[160px] section-context-menu"
          style={{
            left: `${sectionContextMenu.x}px`,
            top: `${sectionContextMenu.y}px`,
          }}
        >
          {sectionContextMenu.section === 'Notes' && (
            <>
              <button
                onClick={() => {
                  navigate('/notes');
                  setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                New Note
              </button>
              {clipboard && (
                <button
                  onClick={() => {
                    handlePaste();
                    setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FilePlus className="w-4 h-4" />
                  Paste {clipboard.type === 'folder' ? 'Folder' : 'Note'}
                </button>
              )}
            </>
          )}
          {sectionContextMenu.section === 'Folders' && (
            <>
              <button
                onClick={() => {
                  handleCreateFolder();
                  setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
              {clipboard && (
                <button
                  onClick={() => {
                    console.log('Pasting from clipboard:', clipboard);
                    handlePaste();
                    setSectionContextMenu(prev => ({ ...prev, isVisible: false }));
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FilePlus className="w-4 h-4" />
                  Paste {clipboard.type === 'folder' ? 'Folder' : 'Note'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Note Context Menu */}
      {noteContextMenu.isVisible && (
        <div
          className="fixed z-50 bg-white shadow-lg rounded-lg py-1 min-w-[160px] note-context-menu"
          style={{
            left: noteContextMenu.x,
            top: noteContextMenu.y
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Copy button clicked for note:', { id: noteContextMenu.noteId, title: noteContextMenu.noteTitle });
              handleCopyNote(noteContextMenu.noteId, noteContextMenu.noteTitle);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCutNote(noteContextMenu.noteId, noteContextMenu.noteTitle);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            Cut
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteNote(noteContextMenu.noteId);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-500 flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Layout;