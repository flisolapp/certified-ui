import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {Location} from '@angular/common';
import {CertificateService} from '../../services/certificate/certificate.service';
import {ConfirmationService, ConfirmEventType} from 'primeng/api';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  term: any = null;
  searched: boolean = false;
  searching: boolean = false;
  items: any[] | null = null;
  downloading: boolean = false;

  private subscriptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private certificateService: CertificateService,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit(): void {
    ScrollService.toTop();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.term = paramMap.get('term');

      if (this.term !== null) //
        this.doSearch();
    });

    setTimeout(() => document.getElementById('term')?.focus(), 200);
  }

  ngOnDestroy = () => this.disposeSubscriptions();
  private disposeSubscriptions = () =>
    this.subscriptions.forEach((item, index, array) => array.shift().unsubscribe());

  public doSearch(): void {
    this.disposeSubscriptions();

    ScrollService.toTop();
    this.location.replaceState('/' + encodeURIComponent(this.term));
    this.searched = this.searching = true;

    this.items = [];

    this.subscriptions.push(this.certificateService.search(this.term).subscribe({
      next: (data: any) => this.items = data,
      error: () => {
        this.searching = false;

        if (this.items?.length === 0) //
          setTimeout(() => document.getElementById('not-found-term')?.focus(), 200);
      },
      complete: () => {
        this.searching = false;

        if (this.items?.length === 0) //
          setTimeout(() => document.getElementById('not-found-term')?.focus(), 200);
      }
    }));
  }

  public doClear(): void {
    this.disposeSubscriptions();

    this.term = null;
    this.searched = this.searching = false;
    this.items = null;
    this.location.replaceState('/');

    setTimeout(() => document.getElementById('term')?.focus(), 200);
  }

  doDownload(item: any): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'fa-solid fa-download',
      accept: () => {
        this.disposeSubscriptions();

        this.downloading = true;
        this.certificateService.download(item.code).then((): void => {
          this.downloading = false;
        }).catch((): void => {
          this.downloading = false;
        });
      },
      reject: (type: number): void => {
        switch (type) {
          case ConfirmEventType.REJECT:
            // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            break;
          case ConfirmEventType.CANCEL:
            // this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            break;
        }
      }
    });
  }

}
