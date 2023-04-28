import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  term: any = null;
  searched: boolean = false;
  searching: boolean = false;
  private searchAnimation: any = null;
  private searchAnimationIteration: number = 0;
  items: any[] | null = null;

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.term = paramMap.get('term');
      console.log(this.term);

      if (this.term !== null) {
        this.searched = true;
        this.searching = true;
        this.doSearchTextAnimate();

        setTimeout((): void => {
          this.searching = false;
          clearInterval(this.searchAnimation);
          this.items = [{}];
        }, 2000);
      }

      // this.searching = false;
      // clearInterval(this.searchAnimation);
      // this.items = [{}];
    });

    ScrollService.toTop();

    // setTimeout((): void => {
    //   this.searching = true;
    //   this.doSearchTextAnimate();
    //
    //   setTimeout((): void => {
    //     this.searching = false;
    //     clearInterval(this.searchAnimation);
    //
    //     this.id = 123;
    //     this.items = [{}, {}];
    //   }, 3000)
    // }, 2000);
  }

  private doSearchTextAnimate(): void {
    clearInterval(this.searchAnimation);
    this.searchAnimation = setInterval((): void => {
      const els: HTMLCollectionOf<Element> = document.getElementsByClassName('searching');

      if (els.length > 0) {
        const el: Element = els[0];
        let searchText: string | null = el.textContent;

        if (searchText !== null) {
          const parts: string[] = searchText.split('.');
          const text: string = 'Searching';

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

      if (!this.searching) //
        clearInterval(this.searchAnimation);
    }, 250);
    this.searchAnimationIteration = 0;
  }

  public clear(): void {
    this.term = null;
    this.searched = false;
    this.searching = false;
    this.searchAnimation = null;
    this.searchAnimationIteration = 0;
    this.items = null;
  }

  download(item: any): void {
    console.log(item);
  }

}
