import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/providers/NotificationProvider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { NotificationType } from '@/types/notification';

const notificationColors: Record<NotificationType, string> = {
  INFO: 'bg-blue-500',
  SUCCESS: 'bg-green-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-red-500'
};

const notificationTypeLabels: Record<NotificationType, string> = {
  INFO: 'Información',
  SUCCESS: 'Éxito',
  WARNING: 'Advertencia',
  ERROR: 'Error'
};

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
          aria-label="Abrir notificaciones"
        >
          <Bell className="h-5 w-5 text-[#363430]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ffb400] text-xs text-[#363430] flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-[#363430]">Notificaciones</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 relative',
                    !notification.isRead && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-2 h-2 mt-2 rounded-full',
                        notificationColors[notification.type]
                      )}
                      title={notificationTypeLabels[notification.type]}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          typeof notification.createdAt === 'object' &&
                            'seconds' in notification.createdAt
                            ? new Date(notification.createdAt.seconds * 1000)
                            : new Date(notification.createdAt),
                          {
                            addSuffix: true,
                            locale: es
                          }
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                      onClick={() => removeNotification(notification.id)}
                      aria-label="Eliminar notificación"
                    >
                      ×
                    </Button>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 hover:bg-[#ffb400] focus-visible:ring-2 focus-visible:ring-[#ffb400]"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marcar como leída
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
