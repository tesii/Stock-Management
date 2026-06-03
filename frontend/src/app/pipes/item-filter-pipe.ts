import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'itemFilter',
})
export class ItemFilterPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
