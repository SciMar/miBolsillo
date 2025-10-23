export interface IBudget {
  id: number;
  name: string;
  amount: number;
  startDate?: Date;
  endDate?: Date;
  userId: number;
}