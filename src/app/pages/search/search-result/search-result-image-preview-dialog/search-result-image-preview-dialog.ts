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
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string, code: string }
  ) {
  }

  public download(): void {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = this.data.imageUrl;
    link.download = 'certificate_' + this.data.code + '.png';
    link.click();
  }

  public close(): void {
    this.dialogRef.close();
  }

}
