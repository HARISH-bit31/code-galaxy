import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appRestrict]',
  standalone: true
})
export class RestrictDirective {

  @HostListener('contextmenu', ['$event'])
  blockRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('keydown', ['$event'])
  blockCopy(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      alert('Copying is disabled in Lab Mode.');
    }
  }

  // block text selection
  @HostListener('selectstart', ['$event'])
  blockSelect(event: Event) {
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event'])
  blockDrag(event: Event) {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  blockDrop(event: Event) {
    event.preventDefault();
  }
}
