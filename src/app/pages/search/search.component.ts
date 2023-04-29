import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {Location} from '@angular/common';
import {CertificateService} from '../../services/certificate/certificate.service';

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
    private certificateService: CertificateService
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
      error: () => this.searching = false,
      complete: () => this.searching = false
    }));
  }

  public doClear(): void {
    this.disposeSubscriptions();

    this.term = null;
    this.searched = this.searching = false;
    this.items = null;
    this.location.replaceState('/');
  }

  doDownload(item: any): void {
    this.disposeSubscriptions();

    this.downloading = true;
    this.certificateService.download(item.code).then((): void => {
      this.downloading = false;
    }).catch((): void => {
      this.downloading = false;
    });
  }

}
