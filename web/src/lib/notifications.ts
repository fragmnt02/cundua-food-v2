import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '@/lib/roles';

interface SendNotificationProps {
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  city: string;
  metadata?: {
    actionId?: string;
    referenceType?: string;
    referenceId?: string;
    additionalInfo?: Record<string, unknown>;
  };
  userId?: string;
}

export async function sendAdminNotification({
  title,
  message,
  type = 'INFO',
  link,
  city,
  metadata
}: SendNotificationProps) {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      title,
      message,
      type,
      priority: 'MEDIUM',
      targetRoles: [UserRole.ADMIN],
      isRead: false,
      createdAt: serverTimestamp(),
      link,
      city,
      metadata
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendClientNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link,
  city,
  metadata
}: SendNotificationProps & { userId: string }) {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      title,
      message,
      type,
      priority: 'MEDIUM',
      targetRoles: [],
      userId,
      isRead: false,
      createdAt: serverTimestamp(),
      link,
      city,
      metadata
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function notifyNewRestaurant(
  restaurantId: string,
  restaurantName: string,
  city: string
) {
  await sendAdminNotification({
    title: 'Nuevo Restaurante Creado',
    message: `Se ha creado un nuevo restaurante: ${restaurantName}`,
    type: 'INFO',
    link: `/${city}/restaurant/${restaurantId}`,
    city,
    metadata: {
      referenceType: 'restaurant',
      referenceId: restaurantId
    }
  });
}

export async function notifyNewUser(email: string, name: string) {
  await sendAdminNotification({
    title: 'Nuevo Usuario Registrado',
    message: `Nuevo usuario registrado: ${name} (${email})`,
    type: 'INFO',
    city: 'ALL',
    metadata: {
      referenceType: 'user',
      additionalInfo: {
        email,
        name
      }
    }
  });
}

export async function notifyNewComment(
  restaurantId: string,
  restaurantName: string,
  comment: string,
  authorName: string,
  city: string,
  userId: string
) {
  await sendAdminNotification({
    title: 'Nuevo Comentario',
    message: `${authorName} comentó en ${restaurantName}: "${comment}"`,
    type: 'INFO',
    link: `/${city}/restaurant/${restaurantId}#comments`,
    city,
    metadata: {
      referenceType: 'comment',
      referenceId: restaurantId,
      additionalInfo: {
        authorName,
        comment
      }
    }
  });

  await sendClientNotification({
    userId,
    title: 'Nuevo Comentario',
    message: `${authorName} comentó en ${restaurantName}: "${comment}"`,
    type: 'INFO',
    link: `/${city}/restaurant/${restaurantId}#comments`,
    city,
    metadata: {
      referenceType: 'comment',
      referenceId: restaurantId,
      additionalInfo: {
        authorName,
        comment
      }
    }
  });
}

export async function notifyRestaurantOwner(
  ownerId: string,
  restaurantId: string,
  restaurantName: string,
  comment: string,
  authorName: string,
  city: string
) {
  await sendClientNotification({
    userId: ownerId,
    title: 'Nuevo Comentario en tu Restaurante',
    message: `${authorName} ha comentado en ${restaurantName}: "${comment}"`,
    type: 'INFO',
    link: `/${city}/restaurant/${restaurantId}#comments`,
    city,
    metadata: {
      referenceType: 'comment',
      referenceId: restaurantId,
      additionalInfo: {
        authorName,
        comment
      }
    }
  });
}
