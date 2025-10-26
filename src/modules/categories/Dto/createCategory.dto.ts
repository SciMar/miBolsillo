import { IsEmpty, IsNotEmpty, Length, MinLength } from "class-validator";

export class createCategoryDTO{
    @IsNotEmpty()
    @Length(4, 15,{message: "La categoria debe tener un minimo de 4 caracteres y un maximo de 15"})
    name: string;

    @IsNotEmpty()
    type: 'income' | 'expense';

    @IsEmpty()
    status?: boolean;
}

