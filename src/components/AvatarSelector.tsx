import React from 'react';
import { X } from 'lucide-react';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  currentAvatar: string | null;
}

const avatars = [
  'hacker.png',
  'human.png',
  'man.png',
  'man(1).png',
  'profile.png',
  'user.png',
  'woman.png',
  'woman(1).png',
  'woman(2).png',
  'profile_10015478.png'
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentAvatar
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Select Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {avatars.map((avatar) => (
            <button
              key={avatar}
              onClick={() => onSelect(avatar)}
              className={`relative p-2 rounded-lg transition-all ${
                currentAvatar === avatar
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={`/${avatar}`}
                alt={`Avatar ${avatar}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector; 