// src/modules/budgets/budgets.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { NotFoundException } from '@nestjs/common';

describe('BudgetsController (unit)', () => {
  let controller: BudgetsController;
  let moduleRef: TestingModule;

  let mockService: any;

  beforeEach(async () => {
    // Recreamos mocks en cada beforeEach para evitar estado compartido
    mockService = {
      createForUser: jest.fn(),
      findAllByUser: jest.fn(),
      findAll: jest.fn(),
      buscarPorNombre: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [{ provide: BudgetsService, useValue: mockService }],
    }).compile();

    controller = moduleRef.get<BudgetsController>(BudgetsController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('buscar should call service.buscarPorNombre', async () => {
    mockService.buscarPorNombre.mockResolvedValue([{ id: 1, name: 'Comida' }]);
    // Nota: El método buscar recibe solo el query 'q', no 'com' directamente.
    const res = await (controller as any).buscar('com'); 
    expect(mockService.buscarPorNombre).toHaveBeenCalledWith('com');
    expect(res).toEqual([{ id: 1, name: 'Comida' }]);
  });

  it('create should call service.createForUser', async () => {
    const dto = { name: 'X', amount: 10 };
    const fakeReq = { user: { id: 1 } } as any;
    mockService.createForUser.mockResolvedValue({ id: 1, name: 'X' });

    const res = await (controller as any).create(dto, fakeReq);

    // El controller llama al servicio con el DTO y el objeto user extraído del Request
    expect(mockService.createForUser).toHaveBeenCalledWith(dto, fakeReq.user);
    expect(res).toHaveProperty('id', 1);
  });

  it('findAll should call service.findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const res = await (controller as any).findAll();
    expect(res).toEqual([]);
  });
  
  // 🎯 CORRECCIÓN CLAVE: Se corrige el orden de los argumentos pasados a findAllByUser.
  it('findAllByUser should call service with categoryId converted to Number', async () => {
    const fakeUserId = 1;
    // Simula lo que recibe el controller: 
    // 1. @Param('userId') = 1 (número, gracias al ParseIntPipe en el controller)
    // 2. @Query('categoryId') = '5' (string, como viene de la URL)
    const categoryIdString = '5'; 
    mockService.findAllByUser.mockResolvedValue([{ id: 10 }]);

    // ✅ La llamada al controller debe ser (userId, categoryIdString)
    await (controller as any).findAllByUser(fakeUserId, categoryIdString);

    const calls = mockService.findAllByUser.mock.calls;

    // El controller debe llamar al servicio con el categoryId ya convertido a número.
    const callWithOptions5 = calls.some(call =>
      call[0] === fakeUserId && call[1] && call[1].categoryId === 5
    );

    expect(callWithOptions5).toBe(true);
  });

  // Este test también se beneficia de la corrección del orden de argumentos
  it('findAllByUser should call service without categoryId when query is not provided', async () => {
    const fakeUserId = 1;
    mockService.findAllByUser.mockResolvedValue([]);

    // ✅ La llamada al controller debe ser solo (userId) si el query es opcional/no está.
    await (controller as any).findAllByUser(fakeUserId);

    expect(mockService.findAllByUser).toHaveBeenCalledWith(
      1,
      // Se afirma que el segundo argumento de filtros no contiene categoryId
      expect.not.objectContaining({ categoryId: expect.anything() })
    );
  });

  it('findOne should call service.findOne (success)', async () => {
    mockService.findOne.mockResolvedValue({ id: 2 });
    const res = await (controller as any).findOne(2);
    expect(mockService.findOne).toHaveBeenCalledWith(2);
    expect(res).toEqual({ id: 2 });
  });

  // Este test está bien configurado, usa mockRejectedValue para simular el fallo del servicio.
  it('findOne should throw NotFoundException if budget is not found', async () => {
    mockService.findOne.mockRejectedValue(new NotFoundException());
    await expect((controller as any).findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update should call service.update (success)', async () => {
    const updateDto = { name: 'u' };
    mockService.update.mockResolvedValue({ id: 3, name: 'u' });
    const res = await (controller as any).update(3, updateDto);
    expect(mockService.update).toHaveBeenCalledWith(3, updateDto);
    expect(res).toEqual({ id: 3, name: 'u' });
  });

  it('update should throw NotFoundException if budget ID is not found', async () => {
    const updateDto = { name: 'u' };
    mockService.update.mockRejectedValue(new NotFoundException());
    await expect((controller as any).update(999, updateDto)).rejects.toThrow(NotFoundException);
  });

  it('remove should call service.remove (success)', async () => {
    mockService.remove.mockResolvedValue({ mensaje: 'Presupuesto eliminado' });
    const res = await (controller as any).remove(3);
    expect(mockService.remove).toHaveBeenCalledWith(3);
    expect(res).toHaveProperty('mensaje');
  });

  it('remove should throw NotFoundException if budget does not exist', async () => {
    mockService.remove.mockRejectedValue(new NotFoundException());
    await expect((controller as any).remove(999)).rejects.toThrow(NotFoundException);
  });
});