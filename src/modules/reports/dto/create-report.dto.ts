export class CreateReportDto {
  name: string;
  type: string;
  filters?: any;
  userId: number;
}