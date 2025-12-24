import React from 'react';
import { AVATARS } from '../constants';

interface Props {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export const AvatarSelector: React.FC<Props> = ({ selectedAvatar, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-sm">
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          onClick={() => onSelect(avatar)}
          className={`
            aspect-square flex items-center justify-center text-3xl rounded-xl transition-all duration-300
            ${selectedAvatar === avatar 
              ? 'bg-white/80 dark:bg-slate-700 ring-2 ring-blue-500 scale-110 shadow-lg' 
              : 'hover:bg-white/40 dark:hover:bg-white/10 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}
          `}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
};