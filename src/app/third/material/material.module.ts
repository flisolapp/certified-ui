import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  exports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatCardModule,
    MatProgressBarModule,
    ClipboardModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class MaterialModule {
}
