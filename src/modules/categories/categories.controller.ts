import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategodyDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService){}

    @Get() // todas las categorias (admin)
    getAllCaterories(){
        return this.categoryService.getCategory()
    }

    @Get() // todas las categorias activas (estandar)
    getCaterories(){
        return this.categoryService.getCategory()
    }

    @Get('income') // todas las categorias activas  por ingresos (todos)
    getIncome(){
        return this.categoryService.getCategory()
    }

    @Get('expense') // todas las categorias activas por egresos  (todos)
    getExpense(){
        return this.categoryService.getCategory()
    }

    @Get('income')//categorias activas de ingreso por id  (todos)
    getIdIncome(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.getById(id)
    }

    @Get('expense')//categorias activas de egreso por id  (todos)
    getIdExpense(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.getById(id)
    }

    @Get('income/name/:name')//categorias activas de ingreso por nombre  (todos)
    getNameIncome(@Param('name')name:string){
        return this.categoryService.getByName(name)
    }

    @Get('expense/name/:name')//categorias activas de egreso por nombre  (todos)
    getNameExpense(@Param('name')name:string){
        return this.categoryService.getByName(name)
    }
// Crear categorias de ingreso(admin- premium)
    @Post('income')
    createIncome(@Body()body:createCategodyDTO){
        return this.categoryService.createCategory(body)
    }

    // Crear categorias de egreso (admin- premium)
    @Post('expense')
    createExpense(@Body()body:createCategodyDTO){
        return this.categoryService.createCategory(body)
    }
    // actualizar categorias de ingreso (admin)
    @Put('income')
    updateIncome(@Param('id', ParseIntPipe)id:number, @Body()body:updateCategoryDTO){
        return this.categoryService.updateCategory(id, body)
    }

    // actualizar categorias de egreso (admin)
    @Put('expense')
    updateExpense(@Param('id', ParseIntPipe)id:number, @Body()body:updateCategoryDTO){
        return this.categoryService.updateCategory(id, body)
    }
//eliminar categoria ingreso(admin)
    @Delete('income/:id')
    deleteIncome(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.deleteCategory(id)
    }
//eliminar categoria egreso(admin)
    @Delete('expense/:id')
    deleteExpense(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.deleteCategory(id)
    }
}
