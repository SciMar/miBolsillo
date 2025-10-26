import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Repository } from 'typeorm';
import { createCategoryDTO } from './Dto/createCategory.dto';
import { updateCategoryDTO } from './Dto/updateCategory.dto';


@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>
    ){}

    getCategoryAdmi(){// ver todas las categorias- ADMIN
       return this.categoryRepo.find()
     }

    getActive(){ // ver categorias activas -ADMIN
        return this.categoryRepo.findBy({status:true})
    }
    
    getCategory() {//ver todas las categorias activas pero con el numero de registros de esa categoria ESTANDAR, PREMIUN (ya que admin solo administra categorias)
    return this.categoryRepo.createQueryBuilder('categories')
    .where('categories.status = :status', {status: true} )
    .loadRelationCountAndMap("categories.transactionsCount", 'categories.transactions') 
    .getMany()
    }


    getByType(type: 'income' | 'expense') { //ver categorias activas por el tipo ADMIN, PREMIUN , ESTANDAR
    return this.categoryRepo.find({ where:{type, status:true}});
  }

    async getById(id:number){//ver categorias por id - ADMIN
        const findIdC = await this.categoryRepo.findOneBy({id})
        if (!findIdC) throw new NotFoundException(`Categoria con el id'${id}' no encontrada`)
        return findIdC
    }

    async getByName(name:string){ // ver categorias activas por nombre- ADMIN, ESTANDAR, PREMIUN
        const foundName= await this.categoryRepo.createQueryBuilder('categories')
        .where('categories.name LIKE :name', { name: `%${name}%`}).andWhere('categories.status = :status',{status: true})
        .getMany()
        if (foundName.length === 0) throw new NotFoundException(`Categoria con el nombre '${name}' no encontrada`)
        return foundName
    }

    async createCategory(newCategory: createCategoryDTO){ // ADMIN, PREMIUN
        const nameCataegory = await this.categoryRepo.findOne({where:{name:newCategory.name}})
        if (nameCataegory) throw new BadRequestException(`Ya existe una categoría con el nombre ${newCategory.name}`);
        const categoryCreated = this.categoryRepo.create(newCategory)
        if(!['income', 'expense'].includes(newCategory.type)) throw new BadRequestException ("El tipo no es income ni expense, ingrese un tipo valido")
        return this.categoryRepo.save(categoryCreated)
    } // newCategory.type != 'expense'&& newCategory.type != 'income'

    async updateCategory(id:number, updateCategory: updateCategoryDTO){ //ADMIN
        await this.getById(id)
        await this.categoryRepo.update(id, updateCategory)
        if(updateCategory.status === true){
            return {message: `La categoria con id ${id} se actualizo y se activo correctamente`}
        }else if(updateCategory.status === false){
            return {message: `La categoria con id ${id} se actualizo y se desactivo correctamente`}
        }
        if(updateCategory.type){
            if(updateCategory.type != 'expense'&& updateCategory.type != 'income') throw new BadRequestException ("El tipo no es income ni expense, ingrese un tipo valido")
                return {message: `La categoria con id ${id} se actualizo correctamente y es de tipo: ${updateCategory.type}`
            }
        }
        return { message: `La categoria con id ${id} se actualizo correctamente` };
    }
    

    async desactivateCategory(id:number){  //ADMIN PREMIUN pero si admin ya lo hace en update solo pa premiun?
        const byeCategory = await this.getById(id)
        byeCategory.status = false
        await this.categoryRepo.save(byeCategory)
        return {message: `La categoria con id ${id} se desactivo correctamente`}
    }

}