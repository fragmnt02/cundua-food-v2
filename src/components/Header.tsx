'use client';

import { useCity } from '@/hooks/useCity';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { FaUserCircle, FaPlus, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CITY_USER_FRIENDLY_NAME, CITIES } from '@/lib/constants';
import { useState, useEffect, useRef } from 'react';

export const Header = () => {
  const { city, updateCity } = useCity();
  const { isAdmin } = useAdmin();
  const { user, logout } = useAuth();

  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-[#ffc433]">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.svg"
          alt="Tabascomiendo Logo"
          className="rounded-full h-12 w-auto cursor-pointer"
          width={48}
          height={48}
          onClick={() => router.push('/')}
        />
        <select
          className="p-2 border rounded bg-transparent text-[#363430] border-[#363430]"
          value={city ?? ''}
          onChange={(e) => updateCity(e.target.value)}
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

      <div className="flex items-center gap-4">
        {isAdmin && (
          <FaPlus
            className="text-2xl text-[#363430] cursor-pointer hover:opacity-80"
            onClick={() => router.push('/admin/create')}
          />
        )}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <FaUser
                className="text-4xl text-[#363430] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transition-all duration-300 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  {user.email}
                </div>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <FaUserCircle
                className="text-4xl text-[#363430] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transition-all duration-300 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <button
                  onClick={() => router.push('/auth/login')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Iniciar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
