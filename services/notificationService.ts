type NotificationType = 'success' | 'info' | 'error';

interface NotificationEvent {
  message: string;
  type?: NotificationType;
}

type Listener = (notification: NotificationEvent) => void;

class NotificationService {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(message: string, type: NotificationType = 'info') {
    this.listeners.forEach(listener => listener({ message, type }));
  }
}

export const notificationService = new NotificationService();
