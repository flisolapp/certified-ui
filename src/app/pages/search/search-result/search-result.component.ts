import {Component, OnDestroy, OnInit} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ScrollService} from '../../../services/scroll/scroll.service';
import {CertificateService} from '../../../services/certificate/certificate.service';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CertificateElement} from '../../../models/certificate-element';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  SearchResultDownloadCertificateComponent
} from './search-result-download-certificate/search-result-download-certificate.component';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent implements OnInit, OnDestroy {

  searched: boolean = false;
  searching: boolean = false;
  displayedColumns: string[] = ['edition', 'unit', 'name', 'enjoyedAs', 'code', 'download'];
  dataSource: CertificateElement[] = [];
  downloadingItem: CertificateElement | null = null;

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

  ngOnInit(): void {
    ScrollService.toTop();

    this.route.paramMap.subscribe((paramMap: ParamMap): void => {
      this.doSearch(paramMap.get('term')!);
    });

    this.doSearchSubscription = EventEmitterService.get('search-result-do-search') //
      .subscribe((term: string | any): void => {
        this.doSearch(term!);
      });
  }

  ngOnDestroy(): void {
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

  isStatusSearching(): boolean {
    return this.searching;
  }

  isStatusItemsNotFound(): boolean {
    return (this.searched) && (!this.searching) && (this.dataSource !== null) && (this.dataSource.length === 0);
  }

  isStatusItemsFound(): boolean {
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
