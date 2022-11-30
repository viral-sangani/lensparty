import { MoonIcon, SunIcon } from '@heroicons/react/outline';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

const ThemeToggle: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (localStorage.getItem('color-theme')) {
      if (localStorage.getItem('color-theme') === 'light') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      }

      // if NOT set via local storage previously
    } else {
      if (document.documentElement.classList.contains('dark')) {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      } else {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      }
    }
  };

  return (
    <div
      className="flex items-start justify-center rounded-full hover:bg-gray-300 p-2 hover:bg-opacity-20  cursor-pointer"
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 dark:text-white text-black" />
      ) : (
        <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6 dark:text-white text-black" />
      )}
    </div>
  );
};

export default ThemeToggle;
