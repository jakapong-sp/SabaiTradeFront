import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeNumber'
})
export class PipeNumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.replace(/,/g, '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
