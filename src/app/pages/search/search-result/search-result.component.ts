import {Component, OnDestroy, OnInit} from '@angular/core';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Platform} from '@angular/cdk/platform';
import {CertificateService} from '../../../services/certificate/certificate.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ScrollService} from '../../../services/scroll/scroll.service';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {
  SearchResultDownloadCertificateComponent
} from './search-result-download-certificate/search-result-download-certificate.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
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

@Component({
  selector: 'app-search-result',
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
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent implements OnInit, OnDestroy {

  public searched: boolean = false;
  public searching: boolean = false;
  public displayedColumns: string[] = ['edition', 'unit', 'name', 'enjoyedAs', 'code', 'download'];
  public dataSource: CertificateElement[] = [];
  public downloadingItem: CertificateElement | null = null;

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

  public ngOnInit(): void {
    ScrollService.toTop();

    this.route.paramMap.subscribe((paramMap: ParamMap): void => {
      this.doSearch(paramMap.get('term')!);
    });

    this.doSearchSubscription = EventEmitterService.get('search-result-do-search') //
      .subscribe((term: string | any): void => {
        this.doSearch(term!);
      });
  }

  public ngOnDestroy(): void {
    this.disposeSubscriptions();

    if (this.doSearchSubscription !== null) //
      this.doSearchSubscription.unsubscribe();
  }

  private disposeSubscriptions(): void {
    this.subscriptions.forEach((item, index, array) => //
      array.shift().unsubscribe());
  }

  public doSearch(term: string): void {
    this.disposeSubscriptions();

    this.dataSource = [];
    this.searched = this.searching = true;
    EventEmitterService.get('searching').emit(this.searching);

    setTimeout((): void => {
      this.subscriptions.push(this.certificateService.search(term).subscribe({
        next: (data: any): any => this.dataSource = data,
        error: (): void => {
          this.searching = false;

          if (this.dataSource?.length === 0) //
            EventEmitterService.get('search-items-not-found').emit();
        },
        complete: (): void => {
          this.searching = false;

          if (this.dataSource?.length === 0) //
            EventEmitterService.get('search-items-not-found').emit();
        }
      }));
    }, 500);
  }

  public isStatusSearching(): boolean {
    return this.searching;
  }

  public isStatusItemsNotFound(): boolean {
    return (this.searched) && (!this.searching) && (this.dataSource !== null) && (this.dataSource.length === 0);
  }

  public isStatusItemsFound(): boolean {
    return (this.searched) && (!this.searching) && (this.dataSource !== null) && (this.dataSource.length > 0);
  }

  public doClear(): void {
    this.disposeSubscriptions();

    this.searched = this.searching = false;
    this.dataSource = [];

    EventEmitterService.get('search-clear').emit();
    this.router.navigate(['/']).then((result: boolean): void => {
      // Do nothing.
    });
  }

  public doCopyCodeToClipboard(item: any): void {
    this.translate.get(['common.copied']).subscribe({
      next: (values: any): void => {
        const content: string = window.location.origin + '/' + item.code;
        this.clipboard.copy(content);
        this.snackBar.open(values['common.copied'] + ': ' + content, undefined, {
          duration: 1000
        });
      }
    });
  }

  public doDownload(item: any): void {
    const dialogRef: MatDialogRef<SearchResultDownloadCertificateComponent> = //
      this.dialog.open(SearchResultDownloadCertificateComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.disposeSubscriptions();

        this.downloadingItem = item;
        this.certificateService //
          .download(item.code) //
          .then((): null => this.downloadingItem = null) //
          .catch((): null => this.downloadingItem = null);
      }
    });
  }

}
