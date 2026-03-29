'use client';

interface ThemeToggleProps {
  theme: 'boy' | 'girl';
  onToggle: (theme: 'boy' | 'girl') => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <div className="flex items-center bg-white/15 rounded-full p-0.5">
      <button
        onClick={() => onToggle('boy')}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          theme === 'boy'
            ? 'bg-white text-boy-600 shadow-sm'
            : 'text-white/70 hover:text-white'
        }`}
      >
        Boy
      </button>
      <button
        onClick={() => onToggle('girl')}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          theme === 'girl'
            ? 'bg-white text-girl-600 shadow-sm'
            : 'text-white/70 hover:text-white'
        }`}
      >
        Girl
      </button>
    </div>
  );
}
