import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { createCategodyDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';


@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>
        //@InjectRepository(Transaction)
       // private transactiosnRepo: Repository<Transaction>
    ){}

    getCategory(){
        return this.categoryRepo.find()
    }
// falta funcion que me traiga todas las categorias activas
    async getById(id:number){
        const findIdC = await this.categoryRepo.findOneBy({id})
        if (!findIdC) throw new NotFoundException("Categoria no encontrada")
        return findIdC
    }

    async getByName(name:string){
        const findNameC = await this.categoryRepo.findOneBy({name})
        if (!findNameC) throw new NotFoundException("Categoria no encontrada")
            return findNameC
    }

    createCategory(newCategory: createCategodyDTO){
        const categoryCreated = this.categoryRepo.create(newCategory)
        return this.categoryRepo.save(categoryCreated)
    }

    async updateCategory(id:number, updateCategory: updateCategoryDTO){
        await this.categoryRepo.update(id, updateCategory)
        return {message: `La categoria con id ${id} se actualizo correctamente`}
    }

    async deleteCategory(id:number){
        const byeCategory = await this.categoryRepo.delete({id})
        if(!byeCategory) throw new NotFoundException(`Categoria con id ${id} no encontrada`)
            return {message: `La categoria con id ${id} se elimino correctamente`}
    }

    // implementar metodo desactivar categoria solo para premium
}
