import { IsEmpty, IsNotEmpty, Length } from "class-validator";

export class updateCategoryDTO{
        @IsEmpty()
        @Length(4, 15,{message: "La categoria debe tener un minimo de 4 caracteres y un maximo de 15"})
        name?: string;
    
        @IsNotEmpty()
        type?: 'income' | 'expense';

        @IsEmpty()
        status?: boolean;
}

