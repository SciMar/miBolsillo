export interface IIngreso {
  id_ingreso?: number;
  id_usuario: number;
  monto: number;
  categoria: string;
  descripcion?: string;
  fecha_ingreso: Date;
}
