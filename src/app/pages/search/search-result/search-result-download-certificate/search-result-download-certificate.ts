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
  selector: 'app-search-result-download-certificate',
  standalone: true,
  imports: [
    MatDialogTitle,
    TranslatePipe,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './search-result-download-certificate.html',
  styleUrl: './search-result-download-certificate.scss'
})
export class SearchResultDownloadCertificate {

  constructor(
    public dialogRef: MatDialogRef<SearchResultDownloadCertificate>
  ) {
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }
}
