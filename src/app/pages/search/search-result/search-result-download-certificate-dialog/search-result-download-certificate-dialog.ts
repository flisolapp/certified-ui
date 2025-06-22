import {Component} from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-search-result-download-certificate-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    TranslatePipe,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './search-result-download-certificate-dialog.html',
  styleUrl: './search-result-download-certificate-dialog.scss'
})
export class SearchResultDownloadCertificateDialog {

  constructor(
    public dialogRef: MatDialogRef<SearchResultDownloadCertificateDialog>
  ) {
  }

  public close(): void {
    this.dialogRef.close();
  }

}
