import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform  } from "@nestjs/common";
/**
 * ParseUpperTrimPipe:
 * Pipe personalizado que transforma valores tipo string,
 * eliminando espacios y convirtiéndolos a mayúsculas.
 * 
 * Se usa para normalizar datos de entrada antes de llegar al controlador.
 */
@Injectable()
export class ParseUpperTrimPipe implements PipeTransform {
    /**
     * Método transform:
     * Aplica la transformación al valor recibido.
     * 
     * @param value - Dato que se desea transformar.
     * @param metadata - Información del contexto (tipo de dato, ubicación, etc.).
     * @returns El valor en mayúsculas sin espacios.
     * @throws BadRequestException si el valor no es de tipo string.
     */
    transform(value: any, metadata: ArgumentMetadata) {
        if (typeof value === 'string') {
            return value.trim().toUpperCase();
        }
        if (typeof value === 'number') {
            throw new BadRequestException ('El valor tiene que ser string')
        }
        return value;
    }
}