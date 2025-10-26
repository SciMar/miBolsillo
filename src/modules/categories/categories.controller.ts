import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategoryDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService){}

    @Get('all') // todas las categorias (admin)
    getAllCategories(){
        return this.categoryService.getCategoryAdmi()
    }
// admin
    @Get('active')
    getActive(){
        return this.categoryService.getActive()
    }

    @Get() // todas las categorias activas (estandar, premiun)
    getCategories(){
        return this.categoryService.getCategory()
    }
//todos
    @Get('type/:type')
    getType(@Param('type')type:'income'| 'expense'){
        return this.categoryService.getByType(type)
    }
//todos
    @Get(':id')
    getId(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.getById(id)
    }
//todos
    @Get('name/:name')
    getName(@Param('name')name:string){
        return this.categoryService.getByName(name)
    }

// Crear categorias(admin- premium)
    @Post()
    createIncome(@Body()body:createCategoryDTO){
        return this.categoryService.createCategory(body)
    }

    // actualizar categorias (admin)
    @Put(':id')
    updateIncome(@Param('id', ParseIntPipe)id:number, @Body()body:updateCategoryDTO){
        return this.categoryService.updateCategory(id, body)
    }

//eliminar categoria ingreso(admin, premium)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe)id:number){
        return this.categoryService.desactivateCategory(id)
    }

}