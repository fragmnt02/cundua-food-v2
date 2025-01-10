'use client';

import { useCity } from '@/hooks/useCity';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import {
  FaUserCircle,
  FaPlus,
  FaUser,
  FaMapMarkerAlt,
  FaBars
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

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
      onKeyDown={handleKeyDown}
      tabIndex={isOpen ? 0 : -1}
    >
      {children}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

interface MobileMenuProps {
  isAdmin: boolean;
  user: { email: string } | null;
  onLogout: () => void;
  router: {
    push: (path: string) => void;
  };
}

const MobileMenu = memo(
  ({ isAdmin, user, onLogout, router }: MobileMenuProps) => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="sm:hidden hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            aria-label="Abrir menú"
          >
            <FaBars className="text-xl text-[#363430]" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-4">
            {isAdmin && (
              <>
                <Button
                  onClick={() => router.push('/admin/create')}
                  variant="ghost"
                  className="justify-start gap-2"
                >
                  <FaPlus className="text-xl" />
                  Agregar Restaurante
                </Button>
                <Button
                  onClick={() => router.push('/admin/users')}
                  variant="ghost"
                  className="justify-start gap-2"
                >
                  <FaUser className="text-xl" />
                  Usuarios
                </Button>
              </>
            )}

            {user ? (
              <>
                <div
                  className="px-2 py-1 text-sm text-gray-700 border-t"
                  role="status"
                >
                  {user.email}
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="w-full justify-start focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/auth/login')}
                variant="ghost"
                className="w-full justify-start focus-visible:ring-2 focus-visible:ring-[#ffb400]"
              >
                Iniciar Sesión
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

export const Header = memo(() => {
  const { city } = useCity();
  const { isAdmin } = useAdmin();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Navegación principal"
        >
          <div className="flex items-center gap-4 flex-1">
            <Link
              href="/"
              className="focus-visible:ring-2 focus-visible:ring-[#ffb400] rounded-full"
              aria-label="Ir a la página principal"
            >
              <Image
                src="/logo.svg"
                alt="Logo de Tabascomiendo"
                className="rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105"
                width={48}
                height={48}
                priority
              />
            </Link>
            <div className="h-8 w-px bg-gray-200 mx-2" aria-hidden="true" />
            <Link
              href="/select-city"
              className="flex items-center gap-2 text-[#363430] hover:text-[#222] font-medium group focus-visible:ring-2 focus-visible:ring-[#ffb400] rounded-md p-2"
              aria-label={`Seleccionar ciudad: ${
                city
                  ? CITY_USER_FRIENDLY_NAME[
                      city as keyof typeof CITY_USER_FRIENDLY_NAME
                    ]
                  : 'No seleccionada'
              }`}
            >
              <FaMapMarkerAlt
                className="text-lg text-[#ffb400] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <span>
                {city
                  ? CITY_USER_FRIENDLY_NAME[
                      city as keyof typeof CITY_USER_FRIENDLY_NAME
                    ]
                  : 'Selecciona tu ciudad'}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            {isAdmin && (
              <>
                <Button
                  onClick={() => router.push('/admin/create')}
                  variant="ghost"
                  className="hover:bg-[#ffb400] gap-2 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                  aria-label="Crear nuevo restaurante"
                >
                  <FaPlus
                    className="text-xl text-[#363430]"
                    aria-hidden="true"
                  />
                  <span>Agregar Restaurante</span>
                </Button>
                <Button
                  onClick={() => router.push('/admin/users')}
                  variant="ghost"
                  className="hover:bg-[#ffb400] gap-2 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                  aria-label="Administrar usuarios"
                >
                  <FaUser
                    className="text-xl text-[#363430]"
                    aria-hidden="true"
                  />
                  <span>Usuarios</span>
                </Button>
                <div className="h-8 w-px bg-gray-200 mx-2" aria-hidden="true" />
              </>
            )}

            <div className="relative">
              <Button
                onClick={toggleDropdown}
                variant="ghost"
                className="hover:bg-[#ffb400] gap-2 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-controls="user-dropdown"
                id="user-menu"
              >
                {user ? (
                  <>
                    <FaUser
                      className="text-2xl text-[#363430]"
                      aria-hidden="true"
                    />
                    <span>Mi Cuenta</span>
                  </>
                ) : (
                  <>
                    <FaUserCircle
                      className="text-2xl text-[#363430]"
                      aria-hidden="true"
                    />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </Button>

              <Dropdown isOpen={isDropdownOpen} onClose={closeDropdown}>
                {user ? (
                  <>
                    <div
                      className="px-4 py-2 text-sm text-gray-700 border-b truncate"
                      role="status"
                    >
                      {user.email}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => router.push('/auth/login')}
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                    role="menuitem"
                  >
                    Iniciar Sesión
                  </Button>
                )}
              </Dropdown>
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            isAdmin={!!isAdmin}
            user={user}
            onLogout={handleLogout}
            router={router}
          />
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
