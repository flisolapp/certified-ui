import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {Location} from '@angular/common';
import {CertificateService} from '../../services/certificate/certificate.service';
import {ConfirmationService, ConfirmEventType} from 'primeng/api';
import {MenuItemWithCode} from '../../models/menu-item-with-code';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  language: any = null;
  languages: MenuItemWithCode[] = [];
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
    this.languages = [
      {
        label: 'English (USA)',
        icon: 'fi fi-us',
        code: 'en',
        command: (): void => {
          this.languages.forEach((item: MenuItemWithCode): string => item.styleClass = '');
          this.language = this.languages[0];
          this.language.styleClass = 'active';
          console.log(this.language);
        }
      },
      {
        label: 'Portuguese (Brazil)',
        icon: 'fi fi-br',
        code: 'pt',
        command: (): void => {
          this.languages.forEach((item: MenuItemWithCode): string => item.styleClass = '');
          this.language = this.languages[1];
          this.language.styleClass = 'active';
          console.log(this.language);
        }
      },
      {
        label: 'Spanish (Spain)',
        icon: 'fi fi-es',
        code: 'es',
        command: (): void => {
          this.languages.forEach((item: MenuItemWithCode): string => item.styleClass = '');
          this.language = this.languages[2];
          this.language.styleClass = 'active';
          console.log(this.language);
        }
      }
    ];
    this.language = this.languages[0];
    this.language.styleClass = 'active';

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
          setTimeout(() => document.getElementById('term')?.focus(), 200);
      },
      complete: () => {
        this.searching = false;

        if (this.items?.length === 0) //
          setTimeout(() => document.getElementById('term')?.focus(), 200);
      }
    }));
  }

  isStatusStart(): boolean {
    return (!this.searched) && (!this.searching) && (this.items === null);
  }

  isStatusProcessing(): boolean {
    return this.searching || this.downloading;
  }

  isStatusItemsNotFound(): boolean {
    return (this.searched) && (!this.searching) && (this.items !== null) && (this.items.length === 0);
  }

  isStatusItemsFound(): boolean {
    return (this.searched) && (!this.searching) && (this.items !== null) && (this.items.length > 0) && (!this.downloading);
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
