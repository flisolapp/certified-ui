import {Component, Input, signal, WritableSignal} from '@angular/core';
import {CertificateElement} from '../../../../models/certificate-element/certificate-element';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  SearchResultDownloadCertificateDialog
} from './search-result-download-certificate-dialog/search-result-download-certificate-dialog';
import {DownloadService} from '../../../../services/download/download.service';

@Component({
  selector: 'app-search-result-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatIconButton,
    TranslatePipe,
  ],
  templateUrl: './search-result-card.html',
  styleUrl: './search-result-card.scss'
})
export class SearchResultCard {

  @Input()
  dataSource: CertificateElement[] = [];

  public downloadingItem: WritableSignal<CertificateElement | null> = signal<CertificateElement | null>(null);

  constructor(private dialog: MatDialog, private downloadService: DownloadService) {
  }

  public async doDownload(item: CertificateElement): Promise<void> {
    const dialogRef: MatDialogRef<SearchResultDownloadCertificateDialog> =
      this.dialog.open(SearchResultDownloadCertificateDialog);

    dialogRef.afterClosed().subscribe(async (result: any): Promise<void> => {
      if (!result) {
        return;
      }

      this.downloadingItem.set(item);

      try {
        await this.downloadService.download(item.code);
      } finally {
        this.downloadingItem.set(null);
      }
    });
  }

}
