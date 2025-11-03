/*
Interface-> define la forma de los datos que representan un presupuesto.
*/
export interface IBudget {
  id: number;
  name: string;
  amount: number;
  startDate?: Date;
  endDate?: Date;
  userId: number;
}