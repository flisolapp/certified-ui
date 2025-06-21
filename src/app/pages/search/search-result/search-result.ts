import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {ActivatedRoute, Router} from '@angular/router';
import {CertificateService} from '../../../services/certificate/certificate-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ScrollService} from '../../../services/scroll/scroll-service';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter-service';
import {SearchResultDownloadCertificate} from './search-result-download-certificate/search-result-download-certificate';
import {Platform} from '@angular/cdk/platform';
import {Clipboard} from '@angular/cdk/clipboard';
import {first, firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [
    MatProgressSpinner,
    TranslatePipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatButton,
    MatIconButton,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatCardFooter,
    MatProgressBar
  ],
  templateUrl: './search-result.html',
  styleUrl: './search-result.scss'
})
export class SearchResult implements OnInit, OnDestroy {

  public searching = signal(false);
  public searched = signal(false);
  public dataSource = signal<CertificateElement[]>([]);
  public downloadingItem = signal<CertificateElement | null>(null);

  public displayedColumns: string[] = ['edition', 'unit', 'name', 'enjoyedAs', 'code', 'download'];

  private subscriptions: any[] = [];
  private doSearchSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public platform: Platform,
    private certificateService: CertificateService,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  public async ngOnInit(): Promise<void> {
    ScrollService.toTop();

    try {
      const paramMap = await firstValueFrom(this.route.paramMap.pipe(first()));
      const term = paramMap.get('term');
      if (term) {
        await this.doSearch(term);
      }
    } catch {
    }

    this.doSearchSubscription = EventEmitterService.get('search-result-do-search')
      .subscribe(async (term: string) => {
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  public async doSearch(term: string): Promise<void> {
    this.disposeSubscriptions();

    this.dataSource.set([]);
    this.searched.set(true);
    this.searching.set(true);
    EventEmitterService.get('searching').emit(true);

    try {
      const result = await firstValueFrom(this.certificateService.search(term));
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

  public isStatusSearching = computed(() => this.searching());

  public isStatusItemsNotFound = computed(() =>
    this.searched() &&
    !this.searching() &&
    this.dataSource().length === 0
  );

  public isStatusItemsFound = computed(() =>
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

  public doCopyCodeToClipboard(item: CertificateElement): void {
    this.translate.get(['common.copied']).subscribe({
      next: (values: any): void => {
        const content = `${window.location.origin}/${item.code}`;
        this.clipboard.copy(content);
        this.snackBar.open(`${values['common.copied']}: ${content}`, undefined, {
          duration: 1000
        });
      }
    });
  }

  public async doDownload(item: CertificateElement): Promise<void> {
    const dialogRef: MatDialogRef<SearchResultDownloadCertificate> =
      this.dialog.open(SearchResultDownloadCertificate);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.disposeSubscriptions();
        this.downloadingItem.set(item);

        this.certificateService.download(item.code)
          .then(() => this.downloadingItem.set(null))
          .catch(() => this.downloadingItem.set(null));
      }
    });
  }
}
