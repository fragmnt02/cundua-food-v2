'use client';

import { useCity } from '@/hooks/useCity';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { FaUserCircle, FaPlus, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CITY_USER_FRIENDLY_NAME, CITIES } from '@/lib/constants';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dropdown = memo(({ isOpen, onClose, children }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transform transition-all duration-200 ease-in-out z-50
        ${
          isOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible'
        }`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu"
    >
      {children}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export const Header = memo(() => {
  const { city, updateCity } = useCity();
  const { isAdmin } = useAdmin();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateCity(e.target.value);
    },
    [updateCity]
  );

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    closeDropdown();
  }, [logout, closeDropdown]);

  return (
    <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-4 border-b bg-[#ffc433] shadow-sm relative z-50">
      <div className="flex items-center gap-4 flex-1 sm:flex-initial">
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/logo.svg"
            alt="Tabascomiendo Logo"
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105"
            width={48}
            height={48}
            priority
          />
        </Link>
        <div className="relative flex-1 sm:flex-initial max-w-[200px]">
          <select
            className="w-full p-2 border rounded bg-transparent text-[#363430] border-[#363430] cursor-pointer
                     hover:border-[#222] focus:outline-none focus:ring-2 focus:ring-[#363430] focus:border-transparent
                     transition-all duration-200"
            value={city ?? ''}
            onChange={handleCityChange}
            aria-label="Select city"
          >
            <option value="">Selecciona tu ciudad</option>
            {CITIES.map((cityOption) => (
              <option key={cityOption} value={cityOption.toLowerCase()}>
                {
                  CITY_USER_FRIENDLY_NAME[
                    cityOption as keyof typeof CITY_USER_FRIENDLY_NAME
                  ]
                }
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={() => router.push('/admin/create')}
            className="p-2 rounded-full hover:bg-[#ffb400] transition-colors duration-200"
            aria-label="Create new restaurant"
          >
            <FaPlus className="text-2xl text-[#363430]" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-full hover:bg-[#ffb400] transition-colors duration-200"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            {user ? (
              <FaUser className="text-3xl text-[#363430]" />
            ) : (
              <FaUserCircle className="text-3xl text-[#363430]" />
            )}
          </button>

          <Dropdown isOpen={isDropdownOpen} onClose={closeDropdown}>
            {user ? (
              <>
                <div
                  className="px-4 py-2 text-sm text-gray-700 border-b truncate"
                  role="menuitem"
                >
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  role="menuitem"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                role="menuitem"
              >
                Iniciar Sesión
              </button>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
