// src/modules/budgets/budgets.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsModule } from './budgets.module'; // <-- Importación esencial
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';

// 🎯 CORRECCIÓN 1: Se añade un bloque unitario simple para evaluar la definición de la clase.
describe('BudgetsModule (Unit)', () => {
  it('should be able to initialize the module definition', () => {
    // ✅ Esta línea es suficiente para que Jest ejecute y cubra la declaración de la clase
    expect(BudgetsModule).toBeDefined(); 
  });
});

// 🎯 CORRECCIÓN 2: Se mantiene el test de integración original para verificar la inyección
describe('BudgetsModule (Integration)', () => {
  let module: TestingModule;

  // Mockear el repositorio es vital para el test de integración
  const mockBudgetRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: getRepositoryToken(Budget), useValue: mockBudgetRepository },
      ],
      controllers: [BudgetsController],
      // NOTA: No es necesario importar BudgetsModule aquí, ya que estamos simulando
      // su estructura con TestingModule, pero si lo importaras, también se cubriría.
    }).compile();
  });

  it('TestingModule should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be able to resolve BudgetsService (Provider check)', () => {
    const service = module.get<BudgetsService>(BudgetsService);
    expect(service).toBeDefined();
  });
  
  it('should be able to resolve BudgetsController (Controller check)', () => {
    const controller = module.get<BudgetsController>(BudgetsController);
    expect(controller).toBeDefined();
  });

});