'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { UserRole } from '@/lib/roles';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ChevronDown, Check } from 'lucide-react';
import { useCity } from '@/hooks/useCity';
import { Restaurant } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  restaurantIds: string[];
  pendingRole?: UserRole;
  isLoading?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAdmin();
  const { city } = useCity();
  const router = useRouter();
  const [openRestaurantSelectors, setOpenRestaurantSelectors] = useState<{
    [key: string]: boolean;
  }>({});
  const restaurantRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          const errorData = await response.json();
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to fetch users',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRestaurants = async () => {
      if (!city) return;
      try {
        const response = await fetch(`/api/restaurants/${city}`);
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };

    if (isAdmin) {
      fetchUsers();
      fetchRestaurants();
    } else if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router, city]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(restaurantRefs.current).forEach(([userId, ref]) => {
        if (
          openRestaurantSelectors[userId] &&
          ref &&
          !ref.contains(event.target as Node)
        ) {
          setOpenRestaurantSelectors((prev) => ({
            ...prev,
            [userId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openRestaurantSelectors]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // If changing to client role, set as pending
    if (newRole === UserRole.CLIENT) {
      setUsers(
        users.map((user) =>
          user.uid === userId
            ? { ...user, pendingRole: newRole as UserRole }
            : user
        )
      );
      return;
    }

    // Set loading state
    setUsers(
      users.map((user) =>
        user.uid === userId ? { ...user, isLoading: true } : user
      )
    );

    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, newRole })
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.uid === userId
              ? {
                  ...user,
                  role: newRole as UserRole,
                  restaurantIds: [],
                  pendingRole: undefined,
                  isLoading: false
                }
              : user
          )
        );
        toast({
          title: 'Éxito',
          description: 'Rol de usuario actualizado correctamente'
        });
      } else {
        const errorData = await response.json();
        setUsers(
          users.map((user) =>
            user.uid === userId ? { ...user, isLoading: false } : user
          )
        );
        toast({
          title: 'Error',
          description:
            errorData.error || 'Error al actualizar el rol del usuario',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setUsers(
        users.map((user) =>
          user.uid === userId ? { ...user, isLoading: false } : user
        )
      );
      toast({
        title: 'Error',
        description: 'Error al actualizar el rol del usuario',
        variant: 'destructive'
      });
    }
  };

  const handleConfirmClientRole = async (
    userId: string,
    restaurantIds: string[]
  ) => {
    const user = users.find((u) => u.uid === userId);
    if (!user?.pendingRole) return;

    // Set loading state
    setUsers(
      users.map((u) => (u.uid === userId ? { ...u, isLoading: true } : u))
    );

    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          newRole: user.pendingRole,
          restaurantIds
        })
      });

      if (response.ok) {
        setUsers(
          users.map((u) =>
            u.uid === userId
              ? {
                  ...u,
                  role: user.pendingRole!,
                  restaurantIds,
                  pendingRole: undefined,
                  isLoading: false
                }
              : u
          )
        );
        toast({
          title: 'Éxito',
          description:
            'Rol de usuario y restaurantes actualizados correctamente'
        });
      } else {
        const errorData = await response.json();
        setUsers(
          users.map((u) =>
            u.uid === userId
              ? { ...u, pendingRole: undefined, isLoading: false }
              : u
          )
        );
        toast({
          title: 'Error',
          description: errorData.error || 'Error al actualizar el usuario',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setUsers(
        users.map((u) =>
          u.uid === userId
            ? { ...u, pendingRole: undefined, isLoading: false }
            : u
        )
      );
      toast({
        title: 'Error',
        description: 'Error al actualizar el usuario',
        variant: 'destructive'
      });
    }
  };

  const handleRestaurantChange = async (
    userId: string,
    restaurantIds: string[]
  ) => {
    const user = users.find((u) => u.uid === userId);
    if (!user) return;

    // If there's a pending role change to client, handle it differently
    if (user.pendingRole === UserRole.CLIENT) {
      handleConfirmClientRole(userId, restaurantIds);
      return;
    }

    // Set loading state
    setUsers(
      users.map((u) => (u.uid === userId ? { ...u, isLoading: true } : u))
    );

    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          restaurantIds,
          newRole: user.role
        })
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.uid === userId
              ? { ...user, restaurantIds, isLoading: false }
              : user
          )
        );
        toast({
          title: 'Éxito',
          description: 'Restaurantes asignados correctamente'
        });
      } else {
        const errorData = await response.json();
        setUsers(
          users.map((user) =>
            user.uid === userId ? { ...user, isLoading: false } : user
          )
        );
        toast({
          title: 'Error',
          description: errorData.error || 'Error al asignar los restaurantes',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error assigning restaurants:', err);
      setUsers(
        users.map((user) =>
          user.uid === userId ? { ...user, isLoading: false } : user
        )
      );
      toast({
        title: 'Error',
        description: 'Error al asignar los restaurantes',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No users found
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.uid}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none break-all">
                            {user.email}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant={
                                user.emailVerified ? 'default' : 'destructive'
                              }
                            >
                              {user.emailVerified ? 'Verified' : 'Not Verified'}
                            </Badge>
                            <Badge variant="secondary">
                              Created:{' '}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                          {(user.role === UserRole.CLIENT ||
                            user.pendingRole === UserRole.CLIENT) && (
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                              <div
                                className="relative flex-1"
                                ref={(el) => {
                                  if (el) {
                                    restaurantRefs.current[user.uid] = el;
                                  }
                                }}
                              >
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={
                                    openRestaurantSelectors[user.uid] || false
                                  }
                                  aria-haspopup="listbox"
                                  className="w-full sm:w-[200px] justify-between"
                                  onClick={() =>
                                    setOpenRestaurantSelectors((prev) => ({
                                      ...prev,
                                      [user.uid]: !prev[user.uid]
                                    }))
                                  }
                                  disabled={user.isLoading}
                                >
                                  {user.isLoading ? (
                                    <div className="flex items-center">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      <span>Cargando...</span>
                                    </div>
                                  ) : (
                                    <span className="truncate">
                                      {user.restaurantIds.length === 0
                                        ? 'Seleccionar restaurantes'
                                        : `${
                                            user.restaurantIds.length
                                          } restaurante${
                                            user.restaurantIds.length > 1
                                              ? 's'
                                              : ''
                                          }`}
                                    </span>
                                  )}
                                  <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                </Button>
                                {openRestaurantSelectors[user.uid] && (
                                  <div
                                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                                    role="listbox"
                                    aria-multiselectable="true"
                                  >
                                    <div className="flex flex-wrap gap-2">
                                      {restaurants
                                        .sort((a, b) =>
                                          a.name.localeCompare(b.name)
                                        )
                                        .map((restaurant) => (
                                          <Button
                                            key={restaurant.id}
                                            variant={
                                              user.restaurantIds.includes(
                                                restaurant.id
                                              )
                                                ? 'default'
                                                : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => {
                                              const newRestaurantIds =
                                                user.restaurantIds.includes(
                                                  restaurant.id
                                                )
                                                  ? user.restaurantIds.filter(
                                                      (id) =>
                                                        id !== restaurant.id
                                                    )
                                                  : [
                                                      ...user.restaurantIds,
                                                      restaurant.id
                                                    ];
                                              handleRestaurantChange(
                                                user.uid,
                                                newRestaurantIds
                                              );
                                            }}
                                            role="option"
                                            aria-selected={user.restaurantIds.includes(
                                              restaurant.id
                                            )}
                                            className={cn(
                                              'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                                              user.restaurantIds.includes(
                                                restaurant.id
                                              ) && 'text-primary-foreground'
                                            )}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                user.restaurantIds.includes(
                                                  restaurant.id
                                                )
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                            <span className="truncate">
                                              {restaurant.name}
                                            </span>
                                          </Button>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {user.pendingRole === UserRole.CLIENT && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmClientRole(
                                      user.uid,
                                      user.restaurantIds
                                    )
                                  }
                                  disabled={user.isLoading}
                                  className="w-full sm:w-auto"
                                >
                                  {user.isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Confirmar'
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                          <Select
                            value={user.pendingRole || user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.uid, value)
                            }
                            disabled={user.isLoading}
                          >
                            <SelectTrigger className="w-full sm:w-[180px]">
                              {user.isLoading ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Cargando...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Seleccionar rol" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(UserRole).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
