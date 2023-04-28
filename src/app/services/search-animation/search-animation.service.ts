import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchAnimationService {

  private searching: boolean = false;
  private searchAnimation: any = null;
  private searchAnimationIteration: number = 0;

  constructor() {
  }

  public start(text: string): boolean {
    this.searching = true;
    this.animate(text);

    return true;
  }

  public stop(): boolean {
    this.searching = false;
    this.searchAnimation = null;
    this.searchAnimationIteration = 0;

    return false;
  }

  private animate(text: string): void {
    clearInterval(this.searchAnimation);
    this.searchAnimation = setInterval((): void => {
      this.animateText(text);

      if (!this.searching) //
        clearInterval(this.searchAnimation);
    }, 250);
    this.searchAnimationIteration = 0;
  }

  private animateText(text: string): void {
    const els: HTMLCollectionOf<Element> = document.getElementsByClassName('searching');

    if (els.length > 0) {
      const el: Element = els[0];
      let searchText: string | null = el.textContent;

      if (searchText !== null) {
        const parts: string[] = searchText.split('.');

        switch (parts.length - 1) {
          case 0:
            el.textContent = '.' + text + '.';
            break;
          case 2:
            el.textContent = '..' + text + '..';
            break;
          case 4:
            el.textContent = '...' + text + '...';
            break;
          case 6:
            el.textContent = text;
            break;
        }
      }
    }
  }
}
