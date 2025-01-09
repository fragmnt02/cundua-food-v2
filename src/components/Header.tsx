'use client';

import { useCity } from '@/hooks/useCity';
import { useAdmin } from '@/hooks/useAdmin';
import Image from 'next/image';
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CITY_USER_FRIENDLY_NAME, CITIES } from '@/lib/constants';

export const Header = () => {
  const { city, updateCity } = useCity();
  const { isAdmin, handleUserIconClick } = useAdmin();
  const router = useRouter();

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
        <div className="relative group" onClick={handleUserIconClick}>
          <FaUserCircle className="text-4xl text-[#363430]" />
          <div className="absolute hidden group-hover:block bg-black text-white text-sm rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2">
            Proximamente
          </div>
        </div>
      </div>
    </header>
  );
};
