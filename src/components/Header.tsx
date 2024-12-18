'use client';

import { useCity } from '@/hooks/useCity';
import Image from 'next/image';
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const { city, updateCity } = useCity();
  const router = useRouter();

  // Add isAdmin check
  const isAdmin =
    typeof window !== 'undefined' && localStorage.getItem('admin') === 'true';

  // Add click handler for user icon
  const handleUserIconClick = () => {
    const clicks = parseInt(localStorage.getItem('userIconClicks') || '0');
    const newClicks = clicks + 1;
    localStorage.setItem('userIconClicks', newClicks.toString());

    if (newClicks === 10) {
      localStorage.setItem('admin', 'true');
      alert('¡Ahora eres administrador!');
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-[#ffc433]">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.svg"
          alt="Tabascomiendo Logo"
          className="rounded-full h-12 cursor-pointer"
          width={100}
          height={100}
          onClick={() => router.push('/')}
        />
        <select
          className="p-2 border rounded bg-transparent text-[#363430] border-[#363430]"
          value={city}
          onChange={(e) => updateCity(e.target.value)}
        >
          <option value="cunduacan">Cunduacán</option>
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
