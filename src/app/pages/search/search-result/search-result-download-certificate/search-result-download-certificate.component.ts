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
  imports: [
    MatDialogTitle,
    TranslatePipe,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './search-result-download-certificate.component.html',
  styleUrl: './search-result-download-certificate.component.scss'
})
export class SearchResultDownloadCertificateComponent {

  constructor(
    public dialogRef: MatDialogRef<SearchResultDownloadCertificateComponent>
  ) {
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

}
