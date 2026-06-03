import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'itemFilter',
  standalone: true
})
export class ItemFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item =>
      item.name.toLowerCase().includes(searchText) ||
      item.unit.toLowerCase().includes(searchText)
    );
  }
}