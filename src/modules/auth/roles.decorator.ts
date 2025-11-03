import { SetMetadata } from "@nestjs/common";
//Identificador del metadato usado para asociar roles a rutas o controladores
export const ROLES_KEY="roles";
/*
 * Decorador @Roles:
 * Asigna uno o varios roles a un controlador o método específico.
 * @param roles - Lista de roles permitidos para acceder al recurso.
 */
export const Roles=(...roles:string[])=>SetMetadata(ROLES_KEY,roles);


