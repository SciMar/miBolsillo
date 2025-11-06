import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategoryDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService){}

    /* Obtener todas las categorías activas*/
    @Get()
    @ApiOperation({ summary: 'Obtener todas las categorías activas' })
    @ApiResponse({ status: 200, description: 'Lista de categorías activas obtenida correctamente.' })
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM)
    getCategories() {
        return this.categoryService.getCategory();
    }

    /*MOVER ESTA RUTA ANTES DE :id
    * Obtener todas las categorías (activas e inactivas) - ADMIN
    */
    @Get('all')
    @ApiOperation({ summary: 'Obtener todas las categorías (activas e inactivas)' })
    @ApiResponse({ status: 200, description: 'Lista de todas las categorías obtenida correctamente.' })
    @Roles(RolesEnum.ADMIN)
    getAllCategories(){
        return this.categoryService.getCategoryAdmi()
    }

    /* Obtener categorías por tipo (income / expense)*/
    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener categorías por tipo (income o expense)' })
    @ApiResponse({ status: 200, description: 'Lista de categorías por tipo obtenida correctamente.' })
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getType(@Param('type') type: 'income' | 'expense') {
        return this.categoryService.getByType(type);
    }

    /* Obtener categoría por ID*/
    @Get(':id')
    @ApiOperation({ summary: 'Obtener categoría por ID' })
    @ApiResponse({ status: 200, description: 'Categoría obtenida correctamente por ID' })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    @Roles( RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getId(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getById(id);
    }

    @Get('name/:name')
    @ApiOperation({ summary: 'Obtener categorías por nombre (búsqueda parcial)' })
    @ApiResponse({ status: 200, description: 'Lista de categorías obtenida correctamente por nombre.' })
    @ApiResponse({ status: 404, description: 'No se encontraron categorías con el nombre proporcionado.' })
    @Roles(RolesEnum.USER, RolesEnum.PREMIUM, RolesEnum.ADMIN)
    getName(@Param('name')name:string){
        return this.categoryService.getByName(name)
    }

    /* Crear categorias (admin)*/
    @Post()
    @ApiOperation({ summary: 'Crear una nueva categoría' })
    @ApiResponse({ status: 201, description: 'Categoría creada correctamente en la base de datos' })
    @ApiResponse({status:400, description: 'El tipo debe ser "income" o "expense"'})
    @ApiResponse({status:400, description:'Ya existe una categoría con ese nombre'})
    @Roles(RolesEnum.ADMIN)
    createIncome(@Body() body: createCategoryDTO){
        return this.categoryService.createCategory(body);
    }

    /* Actualizar categorias (admin)*/
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una categoría existente' })
    @ApiResponse({status:200, description:"Categoría actualizada correctamente en la base de datos"})
    @ApiResponse({status:400, description:'El tipo debe ser "income" o "expense"'})
    @ApiResponse({status:400, description:'Ya existe una categoría con ese nombre'})
    @Roles(RolesEnum.ADMIN)
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: updateCategoryDTO){
        return this.categoryService.updateCategory(id, body);
    }

    /*Desactivar categoria (admin)*/
    @Delete(':id')
    @ApiOperation({ summary: 'Desactivar una categoría' })
    @ApiResponse({status:200, description:"Categoría desactivada correctamente"})
    @ApiResponse({status:400, description:"La categoría ya se encuentra desactivada"})
    @Roles(RolesEnum.ADMIN)
    removeCategiry(@Param('id', ParseIntPipe) id: number){
        return this.categoryService.desactivateCategory(id);
    }
}