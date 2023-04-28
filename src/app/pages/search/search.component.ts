import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {Location} from '@angular/common';
import {SearchAnimationService} from '../../services/search-animation/search-animation.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  term: any = null;
  searched: boolean = false;
  searching: boolean = false;
  items: any[] | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private searchAnimation: SearchAnimationService
  ) {
  }

  ngOnInit(): void {
    ScrollService.toTop();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.term = paramMap.get('term');

      if (this.term !== null) //
        this.doSearch();
    });
  }

  public doSearch(): void {
    ScrollService.toTop();
    this.location.replaceState('/' + encodeURIComponent(this.term));
    this.searched = this.searching = this.searchAnimation.start('Searching');

    setTimeout((): void => {
      this.searching = this.searchAnimation.stop();
      this.items = [];//{}];
    }, 2000);
  }

  public doClear(): void {
    this.term = null;
    this.searched = this.searching = this.searchAnimation.stop();
    this.items = null;
    this.location.replaceState('/');
  }

  doDownload(item: any): void {
    console.log(item);
  }

}
