export interface INotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: number;
}
