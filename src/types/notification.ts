import { UserRole } from '@/lib/roles';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NotificationMetadata {
  actionId?: string;
  referenceType?: string;
  referenceId?: string;
  additionalInfo?: {
    [key: string]: string | number | boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetRoles: UserRole[];
  isRead: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
  userId: string;
  city: string;
  link?: string;
  metadata?: NotificationMetadata;
}

export interface NotificationPreferences {
  userId: string;
  enableInApp: boolean;
  enablePush: boolean;
  enableEmail: boolean;
}
export { UserRole };
