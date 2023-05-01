import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {Location} from '@angular/common';
import {CertificateService} from '../../services/certificate/certificate.service';
import {ConfirmationService} from 'primeng/api';
import {MenuItemWithCode} from '../../models/menu-item-with-code';
import {LanguageService} from '../../services/language/language.service';
import {TranslateService} from '@ngx-translate/core';

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
    private confirmationService: ConfirmationService,
    private languageService: LanguageService,
    public translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    ScrollService.toTop();
    this.prepareLanguages();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.term = paramMap.get('term');

      if (this.term !== null) //
        this.doSearch();
    });

    setTimeout(() => document.getElementById('term')?.focus(), 200);
  }

  private prepareLanguages(): void {
    this.languages = [];

    for (let i: number = 0; i < LanguageService.LANGUAGES.length; i++) //
      this.languages.push({
        label: LanguageService.LANGUAGES[i].name,
        icon: 'fi fi-' + LanguageService.LANGUAGES[i].flag.toLowerCase(),
        code: LanguageService.LANGUAGES[i].code,
        command: (): void => this.selectLanguage(i)
      });

    this.language = null;
    for (let i: number = 0; i < this.languages.length; i++) //
      if (this.languages[i].code === this.languageService.getSelected().code) //
        this.selectLanguage(i);
  }

  private selectLanguage(id: number, global: boolean = true): void {
    this.languages.forEach((item: MenuItemWithCode): string => item.styleClass = '');
    this.language = this.languages[id];
    this.language.styleClass = 'active';

    if (global) //
      this.languageService.setSelected(LanguageService.LANGUAGES[id]);
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
    this.translate.get(['search.confirmation.title', 'search.confirmation.description']).subscribe({
      next: (values: any): void => {
        this.confirmationService.confirm({
          message: values['search.confirmation.description'],
          header: values['search.confirmation.title'],
          icon: 'fa-solid fa-download',
          accept: (): void => {
            this.disposeSubscriptions();

            this.downloading = true;
            this.certificateService //
              .download(item.code) //
              .then((): boolean => this.downloading = false) //
              .catch((): boolean => this.downloading = false);
          }
        });
      }
    });
  }

}
