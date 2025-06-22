import {TestBed} from '@angular/core/testing';
import {SearchResultDownloadCertificateDialog} from './search-result-download-certificate-dialog';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';

describe('SearchResultDownloadCertificateDialog', () => {
  let component: SearchResultDownloadCertificateDialog;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultDownloadCertificateDialog>>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultDownloadCertificateDialog,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialogRef, useValue: dialogRefMock}
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultDownloadCertificateDialog);
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
