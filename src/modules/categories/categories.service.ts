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

  /* Obtiene todas las categorías activas con el conteo de transacciones */
    getCategory() {
        return this.categoryRepo.createQueryBuilder('categories')
            .where('categories.status = :status', { status: true })
            .loadRelationCountAndMap('categories.transactionsCount', 'categories.transactions') 
            .getMany();
    }

 /* Obtiene categorías activas por tipo (income o expense) */
    getByType(type: 'income' | 'expense') {
        return this.categoryRepo.find({ 
            where: { type, status: true },
            order: { name: 'ASC' } //  Ordenadas alfabéticamente
        });
    }


  /* Busca una categoría por su ID (incluye transacciones) */
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

  /* Busca categorías activas por nombre (búsqueda parcial con LIKE) */
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
  /* Obtiene todas las categorías (activas e inactivas) */
    getCategoryAdmi() {
        return this.categoryRepo.find({
            order: { status: 'DESC', name: 'ASC' } // ⭐ Activas primero, luego alfabético
        });
    }

  /* Crea una nueva categoría (solo ADMIN) */
    async createCategory(newCategory: createCategoryDTO) {
        // ⭐ Validar tipo primero (más eficiente)
        if (!['income', 'expense'].includes(newCategory.type)) {
            throw new BadRequestException('El tipo debe ser "income" o "expense"');
        }

        /* Verificar si ya existe una categoría con ese nombre*/
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

  /* Actualiza una categoría existente por ID (solo ADMIN) */
    async updateCategory(id: number, updateCategory: updateCategoryDTO) {
        await this.getById(id);

        if (updateCategory.type && !['income', 'expense'].includes(updateCategory.type)) {
            throw new BadRequestException('El tipo debe ser "income" o "expense"');
        }

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
        await this.categoryRepo.update(id, updateCategory);

    /* Genera un mensaje dinámico con los cambios realizados */
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


  /* Desactiva una categoría (soft delete lógico) */
    async desactivateCategory(id: number) {
        const category = await this.getById(id);
        
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

  /* Verifica si una categoría se puede eliminar (sin transacciones) */
    async canDelete(id: number): Promise<boolean> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['transactions']
        });
        
        return category && category.transactions.length === 0;
    }


  /* Obtiene estadísticas globales de las categorías */
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