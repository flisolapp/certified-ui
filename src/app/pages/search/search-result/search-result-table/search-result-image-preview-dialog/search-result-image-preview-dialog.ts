import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {CertificateService} from '../../../../../services/certificate/certificate-service';

@Component({
  selector: 'app-search-result-image-preview-dialog',
  imports: [
    MatDialogTitle,
    TranslatePipe,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './search-result-image-preview-dialog.html',
  styleUrl: './search-result-image-preview-dialog.scss'
})
export class SearchResultImagePreviewDialog {

  constructor(
    private dialogRef: MatDialogRef<SearchResultImagePreviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string, code: string },
    private certificateService: CertificateService,
  ) {
  }

  public async download(): Promise<void> {
    const response: Response = await fetch(this.data.imageUrl);
    const blob: Blob = await response.blob();

    await this.certificateService.download(this.data.code, blob);
  }

  public close(): void {
    this.dialogRef.close();
  }

}
