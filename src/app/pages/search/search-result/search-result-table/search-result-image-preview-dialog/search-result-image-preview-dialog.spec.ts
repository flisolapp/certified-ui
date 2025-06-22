import {TestBed} from '@angular/core/testing';
import {SearchResultImagePreviewDialog} from './search-result-image-preview-dialog';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';

describe('SearchResultImagePreviewDialog', () => {
  let component: SearchResultImagePreviewDialog;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultImagePreviewDialog>>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultImagePreviewDialog,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialogRef, useValue: dialogRefMock}
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultImagePreviewDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on onNoClick()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
