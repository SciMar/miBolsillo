import { Roles } from "../entities/user.entity"
/*
Interface-> define la forma de los datos que representan un presupuesto.
*/
export type IUser={
    id:number,
    name:string,
    email:string,
    password:string, 
    role:Roles, 
    isActive:boolean
}