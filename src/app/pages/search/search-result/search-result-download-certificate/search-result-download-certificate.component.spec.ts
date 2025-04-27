import { TestBed } from '@angular/core/testing';
import { SearchResultDownloadCertificateComponent } from './search-result-download-certificate.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('SearchResultDownloadCertificateComponent', () => {
  let component: SearchResultDownloadCertificateComponent;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultDownloadCertificateComponent>>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultDownloadCertificateComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultDownloadCertificateComponent);
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
