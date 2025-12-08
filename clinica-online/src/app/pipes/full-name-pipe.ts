import { Pipe, PipeTransform } from '@angular/core';
import { AnyUsuario } from '../clases/usuario';

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  transform(value: AnyUsuario): string {
    return `${value.nombre.normalize('NFC').replace(/[^\p{L}\s]/gu, '').replace(/\s+/g, ' ').trim()} ${value.apellido.normalize('NFC').replace(/[^\p{L}\s]/gu, '').replace(/\s+/g, ' ').trim()}`;
  }

}
