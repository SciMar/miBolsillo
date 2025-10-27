import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategoryDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService){}

    // =====================
    // VISTAS PARA TODOS LOS USUARIOS
    // =====================

    // Obtener todas las categorías activas
    @Get()
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getCategories() {
        return this.categoryService.getCategory();
    }

    // ⭐ MOVER ESTA RUTA ANTES DE :id
    // Obtener todas las categorías (activas e inactivas) - ADMIN
    @Get('all')
    @Roles(RolesEnum.ADMIN)
    getAllCategories(){
        return this.categoryService.getCategoryAdmi()
    }

    // Obtener categorías por tipo (income / expense)
    @Get('type/:type')
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getType(@Param('type') type: 'income' | 'expense') {
        return this.categoryService.getByType(type);
    }

    // ⭐ Esta ruta debe ir AL FINAL de los GET
    // Obtener categoría por ID
    @Get(':id')
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getId(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getById(id);
    }

    // =====================
    // ADMIN: CRUD COMPLETO
    // =====================

    // Crear categorias (admin)
    @Post()
    @Roles(RolesEnum.ADMIN)
    createIncome(@Body() body: createCategoryDTO){
        return this.categoryService.createCategory(body);
    }

    // Actualizar categorias (admin)
    @Put(':id')
    @Roles(RolesEnum.ADMIN)
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: updateCategoryDTO){
        return this.categoryService.updateCategory(id, body);
    }

    // Eliminar categoria (admin)
    @Delete(':id')
    @Roles(RolesEnum.ADMIN)
    removeCategiry(@Param('id', ParseIntPipe) id: number){
        return this.categoryService.desactivateCategory(id);
    }
}