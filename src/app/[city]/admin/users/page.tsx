'use client';

import { useEffect, useState } from 'react';
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
import { Search, Loader2 } from 'lucide-react';
import { useCity } from '@/hooks/useCity';
import { Restaurant } from '@/types/restaurant';
import { Button } from '@/components/ui/button';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  restaurantId?: string;
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
                  restaurantId: undefined,
                  pendingRole: undefined,
                  isLoading: false
                }
              : user
          )
        );
        toast({
          title: 'Success',
          description: 'User role updated successfully'
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
          description: errorData.error || 'Failed to update user role',
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
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const handleConfirmClientRole = async (
    userId: string,
    restaurantId?: string
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
          restaurantId
        })
      });

      if (response.ok) {
        setUsers(
          users.map((u) =>
            u.uid === userId
              ? {
                  ...u,
                  role: user.pendingRole!,
                  restaurantId,
                  pendingRole: undefined,
                  isLoading: false
                }
              : u
          )
        );
        toast({
          title: 'Success',
          description: 'User role and restaurant updated successfully'
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
          description: errorData.error || 'Failed to update user',
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
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const handleRestaurantChange = async (
    userId: string,
    restaurantId: string
  ) => {
    const user = users.find((u) => u.uid === userId);
    if (!user) return;

    // If there's a pending role change to client, handle it differently
    if (user.pendingRole === UserRole.CLIENT) {
      handleConfirmClientRole(userId, restaurantId);
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
          restaurantId,
          newRole: user.role
        })
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.uid === userId
              ? { ...user, restaurantId, isLoading: false }
              : user
          )
        );
        toast({
          title: 'Success',
          description: 'Restaurant assigned successfully'
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
          description: errorData.error || 'Failed to assign restaurant',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error assigning restaurant:', err);
      setUsers(
        users.map((user) =>
          user.uid === userId ? { ...user, isLoading: false } : user
        )
      );
      toast({
        title: 'Error',
        description: 'Failed to assign restaurant',
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
    <div className="container mx-auto py-8">
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
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.email}
                          </p>
                          <div className="flex gap-2 mt-2">
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
                        <div className="flex gap-4 items-center">
                          {(user.role === UserRole.CLIENT ||
                            user.pendingRole === UserRole.CLIENT) && (
                            <div className="flex gap-2 items-center">
                              <Select
                                value={user.restaurantId}
                                onValueChange={(value) =>
                                  handleRestaurantChange(user.uid, value)
                                }
                                disabled={user.isLoading}
                              >
                                <SelectTrigger className="w-[200px]">
                                  {user.isLoading ? (
                                    <div className="flex items-center">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      <span>Loading...</span>
                                    </div>
                                  ) : (
                                    <SelectValue placeholder="Select restaurant (optional)" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  {restaurants
                                    .sort((a, b) =>
                                      a.name.localeCompare(b.name)
                                    )
                                    .map((restaurant) => (
                                      <SelectItem
                                        key={restaurant.id}
                                        value={restaurant.id}
                                      >
                                        {restaurant.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              {user.pendingRole === UserRole.CLIENT && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmClientRole(user.uid)
                                  }
                                  disabled={user.isLoading}
                                >
                                  {user.isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Confirm'
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
                            <SelectTrigger className="w-[180px]">
                              {user.isLoading ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Select role" />
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
