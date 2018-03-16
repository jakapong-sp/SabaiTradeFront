import { Pipe, PipeTransform } from '@angular/core';
// http://karlclement.com/blog/dev/angular2/2016/04/10/capitalize-pipe-angular2/
@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {
    transform(value: any) {
        if (value) {
            // debugger;
            const splitted = value.split('.', 3);
            return splitted[0] + ' ' + splitted[1];
        }
        return value;
    }

}
