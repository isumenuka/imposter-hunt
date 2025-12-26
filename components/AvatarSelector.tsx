import React from 'react';
import { AVATARS } from '../constants';

interface Props {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  takenAvatars?: string[]; // Avatars already selected by other players
}

export const AvatarSelector: React.FC<Props> = ({ selectedAvatar, onSelect, takenAvatars = [] }) => {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-sm">
      {AVATARS.map((avatar) => {
        const isTaken = takenAvatars.includes(avatar);
        const isSelected = selectedAvatar === avatar;
        const isDisabled = isTaken && !isSelected;

        return (
          <button
            key={avatar}
            onClick={() => !isDisabled && onSelect(avatar)}
            disabled={isDisabled}
            className={`
              aspect-square flex items-center justify-center text-3xl rounded-xl transition-all duration-300 relative
              ${isSelected
                ? 'bg-white/80 dark:bg-slate-700 ring-2 ring-blue-500 scale-110 shadow-lg'
                : isDisabled
                  ? 'opacity-30 cursor-not-allowed grayscale'
                  : 'hover:bg-white/40 dark:hover:bg-white/10 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}
            `}
          >
            {avatar}
            {isDisabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 rotate-45 scale-150"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};