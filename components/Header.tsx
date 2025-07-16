import React, { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title: ReactNode;
  children?: ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, children }) => {
  const [theme, toggleTheme] = useTheme();

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
      <div className="flex-1 min-w-0">
         <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">
            {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {children}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        </button>
      </div>
    </header>
  );
};