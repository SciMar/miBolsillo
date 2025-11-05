import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';

let mockRepo: any;

describe('BudgetsService (Unit)', () => {
  let service: BudgetsService;

  beforeEach(() => {
    // Limpieza al inicio para evitar estados compartidos entre tests
    jest.clearAllMocks();

    // Mock completo del repositorio TypeORM (métodos usados por el servicio)
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // Define un QueryBuilder básico para las funciones de búsqueda
    const defaultQb: any = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    mockRepo.createQueryBuilder.mockReturnValue(defaultQb);

    service = new BudgetsService(mockRepo as any);
  });

  it('El servicio debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- TESTS para utilidades privadas (fmtDate) ---
  it('fmtDate (private) debe retornar null si recibe undefined o null', () => {
    expect((service as any).fmtDate(undefined)).toBeNull();
    expect((service as any).fmtDate(null)).toBeNull();
  });

  // ---------- createForUser ----------
  it('createForUser debe crear y devolver el presupuesto mapeado (toSpanishResponse)', async () => {
    const dto = { name: 'Comida', amount: 100, startDate: '2025-01-01', endDate: '2025-01-31' };
    const user = { id: 1 };
    const saved = {
      id: 10,
      name: 'Comida',
      amount: '100',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      categoryId: null,
    };

    mockRepo.create.mockReturnValue(saved);
    mockRepo.save.mockResolvedValue(saved);

    const res = await service.createForUser(dto as any, user as any);

    expect(res).toHaveProperty('id', 10);
    expect(res).toHaveProperty('nombre', 'Comida');
    expect(res).toHaveProperty('monto', 100);
    expect(res).toHaveProperty('inicio', '2025-01-01');
    expect(res).toHaveProperty('fin', '2025-01-31');
  });

  it('createForUser debe aceptar categoryId opcional y guardarlo', async () => {
    const dto = { name: 'Viajes', amount: 500, categoryId: 5 };
    const user = { id: 8 };
    const saved = { id: 300, name: 'Viajes', amount: 500, userId: 8, categoryId: 5 };

    mockRepo.create.mockReturnValue(saved);
    mockRepo.save.mockResolvedValue(saved);

    await service.createForUser(dto as any, user as any);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 5 }));
  });

  // aliases nombre / monto
  it('createForUser debe aceptar "nombre" como alias de "name"', async () => {
    const dto = { nombre: 'Comida Alias', amount: 100 };
    const user = { id: 1 };
    const createdEntity = { id: 11, name: 'Comida Alias', amount: 100, userId: 1 };

    mockRepo.create.mockReturnValue(createdEntity);
    mockRepo.save.mockResolvedValue(createdEntity);

    await service.createForUser(dto as any, user as any);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Comida Alias' }));
  });

  it('createForUser debe aceptar "monto" como alias de "amount"', async () => {
    const dto = { name: 'Comida', monto: 100 };
    const user = { id: 1 };
    const createdEntity = { id: 12, name: 'Comida', amount: 100, userId: 1 };

    mockRepo.create.mockReturnValue(createdEntity);
    mockRepo.save.mockResolvedValue(createdEntity);

    await service.createForUser(dto as any, user as any);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 100 }));
  });

  it('createForUser debe lanzar BadRequestException si endDate < startDate', async () => {
    const dto = { name: 'Fechas Mal', amount: 50, startDate: '2025-12-10', endDate: '2025-11-01' };
    await expect(service.createForUser(dto as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
  });

  it('createForUser debe lanzar BadRequestException cuando name falta o es sólo espacios', async () => {
    await expect(service.createForUser({ amount: 50 } as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
    await expect(service.createForUser({ name: '' } as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
    await expect(service.createForUser({ name: '   ' } as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
  });

  it('createForUser debe lanzar BadRequestException cuando amount falta (undefined/null)', async () => {
    await expect(service.createForUser({ name: 'Test' } as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
    await expect(service.createForUser({ name: 'Test', amount: null } as any, { id: 1 } as any)).rejects.toThrow(BadRequestException);
  });

  // ---------- findAllByUser ----------
  it('findAllByUser debe llamar a find con where.userId y retornar mapeado', async () => {
    const raw = [{ id: 3, name: 'A', amount: 10, startDate: null, endDate: null }];
    mockRepo.find.mockResolvedValue(raw);

    const res = await service.findAllByUser(1 as any);
    expect(Array.isArray(res)).toBe(true);
    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
    expect(res[0]).toHaveProperty('nombre', 'A');
    expect(res[0]).toHaveProperty('monto', 10);
  });

  it('findAllByUser debe filtrar por categoryId cuando se proporciona', async () => {
    const raw = [{ id: 4, name: 'Cat', amount: 20, categoryId: 10 }];
    mockRepo.find.mockResolvedValue(raw);

    await service.findAllByUser(1 as any, { categoryId: 10 });

    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1, categoryId: 10 }
    }));
  });

  it('findAllByUser debe ignorar filtros from/to si no implementas lógica de rango', async () => {
    const raw = [{ id: 4, name: 'SinFechas', amount: 1 }];
    mockRepo.find.mockResolvedValue(raw);

    await service.findAllByUser(1 as any, { from: '2025-01-01', to: '2025-12-31' });

    expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
  });

  // ---------- findAll ----------
  it('findAll debe retornar todos los presupuestos mapeados (uso admin)', async () => {
    const raw = [{ id: 5, name: 'Global', amount: 33 }];
    mockRepo.find.mockResolvedValue(raw);

    const res = await service.findAll();

    expect(mockRepo.find).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toHaveProperty('nombre', 'Global');
  });

  // ---------- findOne ----------
  it('findOne debe retornar presupuesto mapeado si existe', async () => {
    const existing = { id: 5, name: 'Viajes', amount: 77, startDate: null, endDate: null, categoryId: null };
    mockRepo.findOne.mockResolvedValue(existing);
    const res = await service.findOne(5);
    expect(res).toHaveProperty('nombre', 'Viajes');
  });

  it('findOne debe lanzar NotFoundException si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ---------- update ----------
  it('update debe actualizar todos los campos válidos y llamar a save', async () => {
    const existing = { id: 10, name: 'Old Name', amount: 50, categoryId: null, startDate: null, endDate: null };
    const updateDto = { name: 'New Name', amount: 100, categoryId: 5, startDate: '2025-02-01', endDate: '2025-02-28' };

    mockRepo.findOne.mockResolvedValue(existing);

    const updatedEntity = { ...existing, ...updateDto, startDate: new Date(updateDto.startDate), endDate: new Date(updateDto.endDate) };
    mockRepo.save.mockResolvedValue(updatedEntity);

    const res = await service.update(10 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Name',
      amount: 100,
      categoryId: 5,
    }));
    expect(res).toHaveProperty('nombre', 'New Name');
  });

  it('update debe actualizar solo el nombre si monto no viene', async () => {
    const existing = { id: 10, name: 'Old Name', amount: 50 };
    const updateDto = { name: 'New Name' };

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, name: 'New Name' };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(10 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Name',
      amount: 50,
    }));
  });

  it('update debe actualizar solo el monto si name no viene', async () => {
    const existing = { id: 10, name: 'Old Name', amount: 50 };
    const updateDto = { amount: 100 };

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, amount: 100 };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(10 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Old Name',
      amount: 100,
    }));
  });

  it('update debe actualizar otros campos (como categoryId) si name/amount no vienen', async () => {
    const existing = { id: 10, name: 'Old Name', amount: 50, categoryId: 1 };
    const updateDto = { categoryId: 5 };

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, categoryId: 5 };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(10 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Old Name',
      amount: 50,
      categoryId: 5
    }));
  });

  it('update debe lanzar BadRequestException si endDate < startDate', async () => {
    const existing = { id: 5, userId: 1 };
    mockRepo.findOne.mockResolvedValue(existing);
    const dto = { startDate: '2025-12-10', endDate: '2025-11-01' };
    await expect(service.update(5 as any, dto as any)).rejects.toThrow(BadRequestException);
  });

  it('update debe lanzar NotFoundException si no existe el entity', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.update(999, { name: 'X' } as any)).rejects.toThrow(NotFoundException);
  });

  // Tests extra para cubrir ramas de asignación parcial (lin. 124-125)
  it('update recorta (trim) el name antes de guardar y mantiene el monto original', async () => {
    const existing = { id: 11, name: 'Old', amount: 77 };
    const updateDto = { name: '   Nuevo Nombre   ' };

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, name: 'Nuevo Nombre' };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(11 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Nuevo Nombre',
      amount: 77,
    }));
  });

  it('update acepta amount = 0 y lo guarda (no lo trata como "faltante")', async () => {
    const existing = { id: 12, name: 'Nombre', amount: 50 };
    const updateDto = { amount: 0 };

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, amount: 0 };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(12 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Nombre',
      amount: 0,
    }));
  });

  // Este test fuerza la rama que asigna `name` incluso si queda vacío ('')
  it('update asigna name = "" si se envía solo espacios (trim -> empty string) y la rama de asignación se ejecuta', async () => {
    const existing = { id: 13, name: 'Anterior', amount: 99 };
    const updateDto = { name: '   ' }; // trim -> ''

    mockRepo.findOne.mockResolvedValue(existing);
    const saved = { ...existing, name: '' };
    mockRepo.save.mockResolvedValue(saved);

    await service.update(13 as any, updateDto as any);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      name: '',
      amount: 99,
    }));
  });

  // ---------- remove ----------
  it('remove debe eliminar y devolver mensaje', async () => {
    const existing = { id: 10 };
    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.remove.mockResolvedValue(existing);

    const res = await service.remove(10);
    expect(mockRepo.remove).toHaveBeenCalledWith(existing);
    expect(res).toEqual({ mensaje: 'Presupuesto eliminado' });
  });

  it('remove debe lanzar NotFoundException si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  // ---------- buscarPorNombre ----------
  it('buscarPorNombre retorna error si query vacío o solo espacios', async () => {
    const r1 = await service.buscarPorNombre('');
    expect(r1).toEqual({ mensaje: 'Debe ingresar un texto para buscar' });

    const r2 = await service.buscarPorNombre('   ');
    expect(r2).toEqual({ mensaje: 'Debe ingresar un texto para buscar' });
  });

  it('buscarPorNombre retorna array con coincidencias mapeadas', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 2, name: 'Comida', amount: 5, startDate: null, endDate: null, categoryId: null }]),
    };
    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const res = await service.buscarPorNombre('com');
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toHaveProperty('nombre', 'Comida');
  });

  it('buscarPorNombre retorna mensaje si no hay coincidencias', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const res = await service.buscarPorNombre('xyz');
    expect(res).toEqual({ mensaje: 'No se encontraron presupuestos con ese nombre' });
  });
});
