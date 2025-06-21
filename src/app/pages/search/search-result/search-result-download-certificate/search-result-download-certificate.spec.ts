import {TestBed} from '@angular/core/testing';
import {SearchResultDownloadCertificate} from './search-result-download-certificate';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';

describe('SearchResultDownloadCertificate', () => {
  let component: SearchResultDownloadCertificate;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultDownloadCertificate>>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultDownloadCertificate,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialogRef, useValue: dialogRefMock}
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultDownloadCertificate);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on onNoClick()', () => {
    component.onNoClick();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
