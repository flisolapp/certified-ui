import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {TranslateService} from '@ngx-translate/core';
import {EventEmitterService} from '../../services/event-emitter/event-emitter.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {

  term: string | null = '';
  searching: boolean = false;

  private subscriptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService
  ) {
  }

  public ngOnInit(): void {
    ScrollService.toTop();

    this.route.paramMap.subscribe((paramMap: ParamMap): void => {
      this.term = paramMap.get('term');

      if (this.term !== null) //
        this.searching = true;
    });

    this.setFocusOnTermInputField();

    this.subscriptions.push(EventEmitterService.get('search-items-not-found').subscribe((): void => {
      this.searching = false;
      this.setFocusOnTermInputField();
    }));
    this.subscriptions.push(EventEmitterService.get('search-clear').subscribe((): void => {
      this.term = null;
      EventEmitterService.get('search-items-not-found').emit();
    }));
  }

  public ngOnDestroy(): void {
    this.disposeSubscriptions();
  }

  private disposeSubscriptions = () =>
    this.subscriptions.forEach((item, index, array) => array.shift().unsubscribe());

  private setFocusOnTermInputField(): void {
    setTimeout(() => document.getElementById('term')?.focus(), 200);
  }

  public doSearch(): void {
    ScrollService.toTop();
    this.searching = true;
    this.router.navigate(['/', this.term]).then((result: boolean): void => {
      // Do nothing.
    });
    EventEmitterService.get('search-result-do-search').emit(this.term);
  }

}
