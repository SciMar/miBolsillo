import { Roles } from "../entities/user.entity"
export type IUser={
    id:number,
    name:string,
    email:string,
    password:string, 
    role:Roles, 
    isActive:boolean
}