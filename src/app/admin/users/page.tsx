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

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();
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

    if (isAdmin) {
      fetchUsers();
    } else if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
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
            user.uid === userId ? { ...user, role: newRole as UserRole } : user
          )
        );
        toast({
          title: 'Success',
          description: 'User role updated successfully'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update user role',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

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
          {loading ? (
            <div>Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.uid}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{user.email}</p>
                        <div className="flex gap-2">
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
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.uid, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
