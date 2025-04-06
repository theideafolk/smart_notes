import React from 'react';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  currentAvatar: string | null;
}

const avatars = [
  'assets/profile_10015478.png', // Default avatar
  'assets/hacker.png',
  'assets/human.png',
  'assets/man.png',
  'assets/man(1).png',
  'assets/profile.png',
  'assets/user.png',
  'assets/woman.png',
  'assets/woman(1).png',
  'assets/woman(2).png'
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Select Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {avatars.map((avatar) => (
            <div
              key={avatar}
              onClick={() => onSelect(avatar)}
              className={`cursor-pointer rounded-full overflow-hidden border-2 ${
                currentAvatar === avatar ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={`/${avatar}`}
                alt={`Avatar ${avatar}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector; 