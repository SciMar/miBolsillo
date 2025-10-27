import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCategoryDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>
    ){}

    // =====================
    // CONSULTAS GENERALES
    // =====================

    // Ver todas las categorías activas con contador de transacciones
    // ROLES: USER, PREMIUM, ADMIN
    getCategory() {
        return this.categoryRepo.createQueryBuilder('categories')
            .where('categories.status = :status', { status: true })
            .loadRelationCountAndMap('categories.transactionsCount', 'categories.transactions') 
            .getMany();
    }

    // Ver categorías activas por tipo (income/expense)
    // ROLES: USER, PREMIUM, ADMIN
    getByType(type: 'income' | 'expense') {
        return this.categoryRepo.find({ 
            where: { type, status: true },
            order: { name: 'ASC' } // ⭐ Ordenar alfabéticamente
        });
    }

    // Ver categoría por ID
    // ROLES: USER, PREMIUM, ADMIN
    async getById(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['transactions'] // ⭐ Opcional: incluir transacciones si es necesario
        });
        
        if (!category) {
            throw new NotFoundException(`Categoría con el id '${id}' no encontrada`);
        }
        
        return category;
    }

    // Buscar categorías activas por nombre (búsqueda parcial)
    // ROLES: USER, PREMIUM, ADMIN
    async getByName(name: string) {
        const categories = await this.categoryRepo.createQueryBuilder('categories')
            .where('categories.name LIKE :name', { name: `%${name}%` })
            .andWhere('categories.status = :status', { status: true })
            .orderBy('categories.name', 'ASC')
            .getMany();
        
        if (categories.length === 0) {
            throw new NotFoundException(`No se encontraron categorías con el nombre '${name}'`);
        }
        
        return categories;
    }

    // =====================
    // ADMIN: GESTIÓN COMPLETA
    // =====================

    // Ver TODAS las categorías (activas e inactivas)
    // ROLES: ADMIN
    getCategoryAdmi() {
        return this.categoryRepo.find({
            order: { status: 'DESC', name: 'ASC' } // ⭐ Activas primero, luego alfabético
        });
    }

    // Crear nueva categoría
    // ROLES: ADMIN
    async createCategory(newCategory: createCategoryDTO) {
        // ⭐ Validar tipo primero (más eficiente)
        if (!['income', 'expense'].includes(newCategory.type)) {
            throw new BadRequestException('El tipo debe ser "income" o "expense"');
        }

        // Verificar si ya existe una categoría con ese nombre
        const existingCategory = await this.categoryRepo.findOne({
            where: { name: newCategory.name }
        });
        
        if (existingCategory) {
            throw new BadRequestException(
                `Ya existe una categoría con el nombre "${newCategory.name}"`
            );
        }

        const categoryCreated = this.categoryRepo.create(newCategory);
        return this.categoryRepo.save(categoryCreated);
    }

    // Actualizar categoría
    // ROLES: ADMIN
    async updateCategory(id: number, updateCategory: updateCategoryDTO) {
        // Verificar que la categoría existe
        await this.getById(id);

        // ⭐ Validar tipo si viene en el update
        if (updateCategory.type && !['income', 'expense'].includes(updateCategory.type)) {
            throw new BadRequestException('El tipo debe ser "income" o "expense"');
        }

        // ⭐ Verificar nombre duplicado si se está actualizando el nombre
        if (updateCategory.name) {
            const existingCategory = await this.categoryRepo.findOne({
                where: { name: updateCategory.name }
            });
            
            if (existingCategory && existingCategory.id !== id) {
                throw new BadRequestException(
                    `Ya existe otra categoría con el nombre "${updateCategory.name}"`
                );
            }
        }

        // Realizar la actualización
        await this.categoryRepo.update(id, updateCategory);

        // ⭐ Mensajes más claros y consistentes
        const messages: string[] = [`Categoría con id ${id} actualizada correctamente`];
        
        if (updateCategory.status === true) {
            messages.push('Estado: Activada');
        } else if (updateCategory.status === false) {
            messages.push('Estado: Desactivada');
        }
        
        if (updateCategory.type) {
            messages.push(`Tipo: ${updateCategory.type}`);
        }

        return { 
            message: messages.join(' | '),
            id 
        };
    }

    // Desactivar categoría (soft delete)
    // ROLES: ADMIN
    async desactivateCategory(id: number) {
        const category = await this.getById(id);
        
        // ⭐ Verificar si ya está desactivada
        if (!category.status) {
            throw new BadRequestException(`La categoría con id ${id} ya está desactivada`);
        }

        category.status = false;
        await this.categoryRepo.save(category);
        
        return { 
            message: `Categoría con id ${id} desactivada correctamente`,
            id 
        };
    }

    // =====================
    // MÉTODOS AUXILIARES (opcional)
    // =====================

    // ⭐ Verificar si una categoría puede ser eliminada (sin transacciones asociadas)
    async canDelete(id: number): Promise<boolean> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['transactions']
        });
        
        return category && category.transactions.length === 0;
    }

    // ⭐ Obtener estadísticas de categorías (útil para dashboard admin)
    async getStatistics() {
        const [total, active, income, expense] = await Promise.all([
            this.categoryRepo.count(),
            this.categoryRepo.count({ where: { status: true } }),
            this.categoryRepo.count({ where: { type: 'income' } }),
            this.categoryRepo.count({ where: { type: 'expense' } })
        ]);

        return {
            total,
            active,
            inactive: total - active,
            income,
            expense
        };
    }
}