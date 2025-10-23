export class CreateBudgetDto {
  name: string;
  amount: number;
  startDate?: Date;
  endDate?: Date;
  userId: number;
}