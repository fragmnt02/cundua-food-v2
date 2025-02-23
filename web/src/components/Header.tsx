'use client';

import { useCity } from '@/hooks/useCity';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import Image from 'next/image';
import {
  FaUserCircle,
  FaPlus,
  FaUser,
  FaMapMarkerAlt,
  FaBars,
  FaHeart,
  FaQuestionCircle,
  FaBell
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/NotificationBell';

interface MenuItemsProps {
  user: { email: string } | null;
  isAdmin: boolean;
  isClient: boolean;
  city: string;
  onClose?: () => void;
  onLogout: () => void;
  router: ReturnType<typeof useRouter>;
}

const MenuItems = memo(
  ({
    user,
    isAdmin,
    isClient,
    city,
    onClose,
    onLogout,
    router
  }: MenuItemsProps) => {
    const handleNavigation = useCallback(
      (path: string) => {
        router.push(path);
        onClose?.();
      },
      [router, onClose]
    );

    return (
      <>
        {user && (
          <Button
            onClick={() => handleNavigation(`/${city}/favorites`)}
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
          >
            <FaHeart className="text-xl text-[#363430]" />
            <span>Mis Favoritos</span>
          </Button>
        )}

        {isAdmin && (
          <>
            <Button
              onClick={() => handleNavigation(`/${city}/admin/create`)}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              <FaPlus className="text-xl text-[#363430]" />
              <span>Agregar Restaurante</span>
            </Button>
            <Button
              onClick={() => handleNavigation(`/${city}/admin/users`)}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              <FaUser className="text-xl text-[#363430]" />
              <span>Usuarios</span>
            </Button>
            <Button
              onClick={() => handleNavigation(`/${city}/admin/notifications`)}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              <FaBell className="text-xl text-[#363430]" />
              <span>Gestionar Notificaciones</span>
            </Button>
            <Button
              onClick={() => handleNavigation(`/contact`)}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              <FaQuestionCircle className="text-xl text-[#363430]" />
              <span>Agregar mi restaurante</span>
            </Button>
          </>
        )}

        {isClient && (
          <>
            <Button
              onClick={() => handleNavigation(`/${city}/admin/create`)}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              <FaPlus className="text-xl text-[#363430]" />
              <span>Agregar Restaurante</span>
            </Button>
          </>
        )}

        {user ? (
          <>
            <div className="px-4 py-2 text-sm text-gray-700 border-t truncate">
              {user.email}
            </div>
            <Button
              onClick={() => {
                onLogout();
                onClose?.();
              }}
              variant="ghost"
              className="w-full justify-start hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <Button
            onClick={() => handleNavigation('/auth/login')}
            variant="ghost"
            className="w-full justify-start hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
          >
            Iniciar Sesión
          </Button>
        )}
      </>
    );
  }
);

MenuItems.displayName = 'MenuItems';

const MobileMenu = memo(
  ({
    user,
    isAdmin,
    isClient,
    city,
    onLogout,
    router
  }: Omit<MenuItemsProps, 'onClose'>) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="sm:hidden flex items-center gap-2">
        {user && <NotificationBell />}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
              aria-label="Abrir menú"
            >
              <FaBars className="text-xl text-[#363430]" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4">
              <MenuItems
                user={user}
                isAdmin={isAdmin}
                isClient={isClient}
                city={city}
                onLogout={onLogout}
                router={router}
                onClose={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

const DesktopMenu = memo(
  ({
    user,
    isAdmin,
    isClient,
    city,
    onLogout,
    router
  }: Omit<MenuItemsProps, 'onClose'>) => {
    return (
      <div className="hidden sm:flex items-center gap-4">
        {user && <NotificationBell />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-[#ffb400] gap-2 focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              {user ? (
                <>
                  <FaUser className="text-2xl text-[#363430]" />
                  <span>Mi Cuenta</span>
                </>
              ) : (
                <>
                  <FaUserCircle className="text-2xl text-[#363430]" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <MenuItems
              user={user}
              isAdmin={!!isAdmin}
              isClient={!!isClient}
              city={city}
              onLogout={onLogout}
              router={router}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

DesktopMenu.displayName = 'DesktopMenu';

export const Header = memo(() => {
  const { city } = useCity();
  const { isAdmin } = useAdmin();
  const { isClient } = useClient();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Navegación principal"
        >
          <div className="flex items-center gap-4 flex-1">
            <Link
              href={`/${city ? city : 'select-city'}`}
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

          <DesktopMenu
            user={user}
            isAdmin={!!isAdmin}
            isClient={!!isClient}
            city={city}
            onLogout={handleLogout}
            router={router}
          />

          <MobileMenu
            user={user}
            isAdmin={!!isAdmin}
            isClient={!!isClient}
            city={city}
            onLogout={handleLogout}
            router={router}
          />
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
