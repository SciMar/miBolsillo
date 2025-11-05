import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service"
import { Transaction } from "typeorm";
/*
*Definimos el archivo a probar
*Definimos la constante para la prueba
*/ 
const categorys = [
        {id: 1, name: "Arriendo", type: "expense", status: true},
        {id: 2, name: "Transporte", type: "expense", status: false},
        {id: 3, name: "Salario", type: "income", status: true},
        {id: 4, name: "Venta ropa", type: "income", status: false}
    ]

describe('categoriesService', ()=>{
let service: CategoriesService;
let repoCategories: any;
let consultas: any;

beforeEach(()=>{
    jest.clearAllMocks(); // limpieza de mock
    //simulación queryBuilder
    consultas={ 
        where:jest.fn().mockReturnThis(),
        andWhere:jest.fn().mockReturnThis(),
        loadRelationCountAndMap:jest.fn().mockReturnThis(),
        orderBy:jest.fn().mockReturnThis(),
        getMany:jest.fn().mockResolvedValue(categorys),

    },
    //simulación repositorio
    repoCategories={
        //jest.fn()=> mock nuevo, vacio
        find:jest.fn().mockResolvedValue(categorys),
        findOne:jest.fn().mockResolvedValue(categorys),
        save:jest.fn().mockResolvedValue(categorys),
        createQueryBuilder:jest.fn().mockReturnValue(consultas),
        create:jest.fn().mockResolvedValue(categorys),
        update:jest.fn().mockResolvedValue(categorys),
        count:jest.fn().mockResolvedValue(categorys)
    }
    service = new CategoriesService(repoCategories as any);
});

//probamos getcategory
    it('Should return all active categories and the transactions of that category', async ()=>{
        const result = await service.getCategory();
        expect(repoCategories.createQueryBuilder).toHaveBeenCalledWith('categories');
        expect(consultas.where).toHaveBeenCalledWith('categories.status = :status', {status:true});
        expect(consultas.loadRelationCountAndMap).toHaveBeenCalledWith('categories.transactionsCount', 'categories.transactions');
        expect(consultas.getMany).toHaveBeenCalled();
        expect(result).toEqual(categorys);
    });

// probamos getBtype (income)
    it('Should return all active categories by type: income', async()=>{
        const incomeCategories = categorys.filter((cat)=> cat.type === 'income' && cat.status === true)
        repoCategories.find.mockResolvedValue(incomeCategories);
        const result = await service.getByType('income');
        expect(repoCategories.find).toHaveBeenCalledWith({where:{type:'income', status: true}, order:{name: 'ASC'}});
    });
// probamos getBtype (expense)
it('Should return all categories by type: expense', async()=>{
    const expenseCategories = categorys.filter((cat)=> cat.type == 'expense' && cat.status === true)
    repoCategories.find.mockResolvedValue(expenseCategories);
    const result = await  service.getByType('expense');
    expect(repoCategories.find).toHaveBeenCalledWith({where:{type:'expense', status: true}, order:{name: 'ASC'}});
})
//probamos getById
it('Should return the category by id', async()=>{
    repoCategories.findOne.mockResolvedValue(categorys[3]);
    const result = await service.getById(4);
    expect(repoCategories.findOne).toHaveBeenCalledWith({where:{id:4}, relations:['transactions']})
    expect(result.name).toEqual('Venta ropa');
});

// probamos la excepción NotFoundExecption, si no se encuentra una categoria por id
it('Should return NotFoundExeption if category doesn´t exist by id', async()=>{
    repoCategories.findOne.mockResolvedValue(null)
    await expect(service.getById(13232)).rejects.toThrow(NotFoundException)
});
//probamos getByName
it('Should return the category by name or partial name', async()=>{
    repoCategories.createQueryBuilder.mockReturnValue(consultas);
    const result = await service.getByName('Trans');
    expect(repoCategories.createQueryBuilder).toHaveBeenCalledWith('categories');
    expect(consultas.where).toHaveBeenCalledWith('categories.name LIKE :name', { name: `%${'Trans'}%`});
    expect(consultas.andWhere).toHaveBeenCalledWith('categories.status = :status', { status: true });
    expect(consultas.orderBy).toHaveBeenCalledWith('categories.name', 'ASC');
    expect(consultas.getMany).toHaveBeenCalledWith();
    expect(result).toEqual(categorys);
});

// probamos la excepcion NotFoundExecption, si no se encuentra una categoria por nombre
it('Should return NotFoundExeption if category doesn´t exist by name', async()=>{
    const consultas ={
    //sobre escribo mi mock consultas
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]), 
    }
    repoCategories.createQueryBuilder.mockReturnValue(consultas);
    await expect(service.getByName('Valeria')).rejects.toThrow(NotFoundException)
});

//probamos getCategoryAdmi
it('Should return all categories', async()=>{
const result = await service.getCategoryAdmi();
expect(repoCategories.find).toHaveBeenCalledWith({order: { status: 'DESC', name: 'ASC' }});
expect(result).toEqual(categorys);
});

//probamos createCategory
it('Should create a new category', async()=>{
    const newCate ={name: 'Colegio', type: 'expense', status: true}
    /*
    *Simular que no existe esa categoria
    *Simular qu instanciamos la entidad
    *Simular que guarda el nuevo objeto creado 
     */
    repoCategories.findOne.mockResolvedValue(null);
    repoCategories.create.mockReturnValue(newCate);
    repoCategories.save.mockResolvedValue({id:5, ... newCate})
    const result = await service.createCategory(newCate as any)
    expect(repoCategories.findOne).toHaveBeenCalledWith({ where: { name: 'Colegio' } });
    expect(repoCategories.create).toHaveBeenCalledWith(newCate);
    expect(repoCategories.save).toHaveBeenCalledWith(newCate);
    expect(result.id).toBe(5);
    expect(result).toEqual({id: 5, ... newCate});
});

// probamos createCategory pero la excepcion del tipo BdRequestException
it('Should throw BadRequestException if type is invalid', async () => {
  const newCate = { name: 'Viajes', type: 'ahorro', status: true };

  await expect(service.createCategory(newCate as any)).rejects.toThrow(BadRequestException);
  expect(repoCategories.findOne).not.toHaveBeenCalled();
});

// probamos createCategory pero la excepcion del nombre duplicado BdRequestException
it('Should throw BadRequestException if category already exists', async () => {
  const newCate = { name: 'Arriendo', type: 'expense', status: true };

  repoCategories.findOne.mockResolvedValue({ id: 34, ...newCate }); 

  await expect(service.createCategory(newCate as any)).rejects.toThrow(BadRequestException);
  expect(repoCategories.create).not.toHaveBeenCalled();
  expect(repoCategories.save).not.toHaveBeenCalled();
});

// probamos updateCategory
it('Should update category successfully', async () => {
  const id = 4;
  const nuevo = { name: 'ventitas', type: 'income', status: true };

/*
*le decimos que use el metodo mockeado, no el real, spyOn=> me permite utilizar el metodo original pero temporalmente mockeado
*simulamos los metodo: getById, findOne, update
*/
 jest.spyOn(service, 'getById').mockResolvedValue({ id, name: 'Venta ropa', type: 'income', status: false } as any); 
  repoCategories.findOne.mockResolvedValue(null);
  repoCategories.update.mockResolvedValue({});

  const result = await service.updateCategory(id, nuevo as any);//  as any para que me tome el income como tipo y no como string

  expect(service.getById).toHaveBeenCalledWith(4);
  expect(repoCategories.findOne).toHaveBeenCalledWith({ where: { name: 'ventitas' } });
  expect(repoCategories.update).toHaveBeenCalledWith(id, nuevo);
  expect(result).toEqual({message: expect.stringContaining( `Categoría con id ${id} actualizada correctamente`),id: 4,});
});

// probamos updateCategory, si la categoria no existe 
it('Should throw NotFoundException if category does not exist', async () => {
  jest.spyOn(service, 'getById').mockRejectedValue(new NotFoundException());

  await expect(service.updateCategory(99, { name: 'ventitas' } as any)).rejects.toThrow(NotFoundException);
});

// probamos updateCategory, si el tipo es invalido
it('Should throw BadRequestException if type is invalid', async () => {
  jest.spyOn(service, 'getById').mockResolvedValue({ id: 1 } as any);
  
  await expect(service.updateCategory(1, { type: 'otro' } as any)).rejects.toThrow(BadRequestException);
});

// probamos updateCategory, si el nombre es duplicado
it('Should throw BadRequestException if name already exists', async () => {
  const id = 1;
  const nuevo = { name: 'Arriendo' };

  jest.spyOn(service, 'getById').mockResolvedValue({ id } as any);
  repoCategories.findOne.mockResolvedValue({ id: 2, name: 'Arriendo' }); // diferente id, mismo registro

  await expect(service.updateCategory(id, nuevo as any)).rejects.toThrow(BadRequestException);
});

//probamos los mensajes de updateCategory (expense, false)
it('Should return message with status and type changes', async () => {
  const id = 1;
  const nuevo = { status: false, type: 'expense' };

  jest.spyOn(service, 'getById').mockResolvedValue({ id } as any);
  repoCategories.findOne.mockResolvedValue(null);
  repoCategories.update.mockResolvedValue({});

  const result = await service.updateCategory(id, nuevo as any);

  expect(result.message).toContain('Estado: Desactivada');
  expect(result.message).toContain('Tipo: expense');
});

// probamos desactivateCategory
it('Should deactivate category successfully', async () => {
  const id = 2;
  const categoryD = { id, name: 'Transporte', type: 'expense', status: true };

  // Mockeamos getById para devolver la categoría activa
  jest.spyOn(service, 'getById').mockResolvedValue(categoryD as any);
  repoCategories.save.mockResolvedValue({ ...categoryD, status: false });

  const result = await service.desactivateCategory(id);

  expect(service.getById).toHaveBeenCalledWith(id);
  expect(repoCategories.save).toHaveBeenCalledWith({ ...categoryD, status: false });
  expect(result).toEqual({message: `Categoría con id ${id} desactivada correctamente`,id});
});


// probamos desactivateCategory si ya está desactivada
it('Should throw BadRequestException if category is already inactive', async () => {
  const id = 3;
  const categoryD = { id, name: 'Salario', type: 'income', status: false };

  jest.spyOn(service, 'getById').mockResolvedValue(categoryD as any);

  await expect(service.desactivateCategory(id)).rejects.toThrow(BadRequestException);
  expect(repoCategories.save).not.toHaveBeenCalled();
});

// probamos desactivateCategory si no existe la categoría
it('Should throw NotFoundException if category does not exist', async () => {
  const id = 324;

  jest.spyOn(service, 'getById').mockRejectedValue(new NotFoundException());

  await expect(service.desactivateCategory(id)).rejects.toThrow(NotFoundException);
  expect(repoCategories.save).not.toHaveBeenCalled();
});

//probamos getStatistics
it('Should return correct category statistics', async () => {
  // Mocks de los conteos de cada consulta(total, active, income, expense)
  repoCategories.count
    .mockResolvedValueOnce(10) 
    .mockResolvedValueOnce(6)  
    .mockResolvedValueOnce(4)  
    .mockResolvedValueOnce(6); 

  const result = await service.getStatistics();

  // validacion para que que se hayan llamado las 4 veces
  expect(repoCategories.count).toHaveBeenCalledTimes(4);
  // validacion para que que se hayan llamado las 4 veces con los parametros establecidos
  expect(repoCategories.count).toHaveBeenNthCalledWith(1);
  expect(repoCategories.count).toHaveBeenNthCalledWith(2, { where: { status: true } });
  expect(repoCategories.count).toHaveBeenNthCalledWith(3, { where: { type: 'income' } });
  expect(repoCategories.count).toHaveBeenNthCalledWith(4, { where: { type: 'expense' } });

  // Validamos el resultado final
  expect(result).toEqual({total: 10,active: 6,inactive: 4,income: 4,expense: 6,});
});


// probamos getStatistics (sin categorías)
it('Should return all zeros if there are no categories', async () => {
  repoCategories.count.mockResolvedValue(0);

  const result = await service.getStatistics();

  expect(repoCategories.count).toHaveBeenCalledTimes(4);

  expect(result).toEqual({total: 0,active: 0,inactive: 0,income: 0,expense: 0,});
});


})
//mockRejectedValue