import {Component, Input, signal, WritableSignal} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CertificateElement} from '../../../../models/certificate-element/certificate-element';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CertificateService} from '../../../../services/certificate/certificate-service';
import {SearchResultImagePreviewDialog} from './search-result-image-preview-dialog/search-result-image-preview-dialog';

@Component({
  selector: 'app-search-result-table',
  imports: [
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatTable,
    TranslatePipe,
    MatHeaderCellDef
  ],
  templateUrl: './search-result-table.html',
  styleUrl: './search-result-table.scss'
})
export class SearchResultTable {

  @Input()
  dataSource: CertificateElement[] = [];

  public downloadingItem: WritableSignal<CertificateElement | null> = signal<CertificateElement | null>(null);

  public displayedColumns: string[] = ['edition', 'unit', 'name', 'enjoyedAs', 'code', 'preview'];

  constructor(
    private translate: TranslateService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private certificateService: CertificateService) {
  }

  public doCopyCodeToClipboard(item: CertificateElement): void {
    this.translate.get(['common.copied']).subscribe({
      next: (values: any): void => {
        const content = `${window.location.origin}/${item.code}`;
        this.clipboard.copy(content);
        this.snackBar.open(`${values['common.copied']}: ${content}`, undefined, {
          duration: 1000
        });
      }
    });
  }

  public async doPreview(item: CertificateElement): Promise<void> {
    this.downloadingItem.set(item);

    try {
      // Assuming this returns a PNG Blob
      const data: Blob = await this.certificateService.certificate(item.code);

      const imageUrl: string = URL.createObjectURL(data);

      const dialogRef: MatDialogRef<SearchResultImagePreviewDialog> = this.dialog.open(SearchResultImagePreviewDialog, {
        data: {imageUrl, code: item.code},
        width: '800px'
      });

      dialogRef.afterClosed().subscribe((): void => {
        // Clean up memory after dialog closes
        URL.revokeObjectURL(imageUrl);
      });
    } catch (error) {
      console.error('Preview failed', error);
    } finally {
      this.downloadingItem.set(null);
    }
  }

}
