import {Component, computed, OnDestroy, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {CertificateService} from '../../../services/certificate/certificate-service';
import {ScrollService} from '../../../services/scroll/scroll-service';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter-service';
import {first, firstValueFrom} from 'rxjs';
import {PlatformService} from '../../../services/platform/platform-service';
import {SearchResultTable} from './search-result-table/search-result-table';
import {SearchResultCard} from './search-result-card/search-result-card';

@Component({
  selector: 'app-search-result',
  imports: [
    MatProgressSpinner,
    TranslatePipe,
    SearchResultTable,
    SearchResultCard
  ],
  templateUrl: './search-result.html',
  styleUrl: './search-result.scss'
})
export class SearchResult implements OnInit, OnDestroy {

  public searching: WritableSignal<boolean> = signal<boolean>(false);
  public searched: WritableSignal<boolean> = signal(false);
  public dataSource: WritableSignal<CertificateElement[]> = signal<CertificateElement[]>([]);

  private subscriptions: any[] = [];
  private doSearchSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private certificateService: CertificateService,
    public platformService: PlatformService
  ) {
  }

  public async ngOnInit(): Promise<void> {
    ScrollService.toTop();

    try {
      const paramMap: ParamMap = await firstValueFrom(this.route.paramMap.pipe(first()));
      const term: string | null = paramMap.get('term');

      if (term) {
        await this.doSearch(term);
      }
    } catch {
    }

    this.doSearchSubscription = EventEmitterService.get('search-result-do-search')
      .subscribe(async (term: string): Promise<void> => {
        await this.doSearch(term);
      });
  }

  public ngOnDestroy(): void {
    this.disposeSubscriptions();
    if (this.doSearchSubscription?.unsubscribe) {
      this.doSearchSubscription.unsubscribe();
    }
  }

  private disposeSubscriptions(): void {
    this.subscriptions.forEach((sub: any): void => sub.unsubscribe());
    this.subscriptions = [];
  }

  public async doSearch(term: string): Promise<void> {
    this.disposeSubscriptions();

    this.dataSource.set([]);
    this.searched.set(true);
    this.searching.set(true);
    EventEmitterService.get('searching').emit(true);

    try {
      const result: CertificateElement[] = await firstValueFrom(this.certificateService.search(term));
      this.dataSource.set(result);
    } catch (error) {
      this.searching.set(false);

      if (this.dataSource()?.length === 0) {
        EventEmitterService.get('search-items-not-found').emit();
      }

      return;
    }

    this.searching.set(false);

    if (this.dataSource()?.length === 0) {
      EventEmitterService.get('search-items-not-found').emit();
    }
  }

  public isStatusSearching: Signal<boolean> = computed((): boolean => this.searching());

  public isStatusItemsNotFound: Signal<boolean> = computed((): boolean =>
    this.searched() &&
    !this.searching() &&
    this.dataSource().length === 0
  );

  public isStatusItemsFound: Signal<boolean> = computed(() =>
    this.searched() &&
    !this.searching() &&
    this.dataSource().length > 0
  );

  public async doClear(): Promise<void> {
    this.disposeSubscriptions();

    this.searched.set(false);
    this.searching.set(false);
    this.dataSource.set([]);

    EventEmitterService.get('search-clear').emit();
    await this.router.navigate(['/']);
  }

}
