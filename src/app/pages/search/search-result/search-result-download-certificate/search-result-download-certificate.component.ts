import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-search-result-download-certificate',
  templateUrl: './search-result-download-certificate.component.html',
  styleUrl: './search-result-download-certificate.component.scss'
})
export class SearchResultDownloadCertificateComponent {

  constructor(
    public dialogRef: MatDialogRef<SearchResultDownloadCertificateComponent>
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
