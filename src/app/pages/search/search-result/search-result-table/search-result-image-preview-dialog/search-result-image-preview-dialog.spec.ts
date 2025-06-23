import {TestBed} from '@angular/core/testing';
import {SearchResultImagePreviewDialog} from './search-result-image-preview-dialog';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';
import {CertificateService} from '../../../../../services/certificate/certificate-service';

describe('SearchResultImagePreviewDialog', () => {
  let component: SearchResultImagePreviewDialog;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultImagePreviewDialog>>;
  let certificateServiceMock: jasmine.SpyObj<CertificateService>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    certificateServiceMock = jasmine.createSpyObj('CertificateService', ['download']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultImagePreviewDialog,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideZonelessChangeDetection(),
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: CertificateService, useValue: certificateServiceMock},
        {
          provide: MAT_DIALOG_DATA,
          useValue: {imageUrl: 'https://example.com/image.png', code: 'CERT123'}
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultImagePreviewDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should download image and call certificateService.download', async () => {
    // Mock do fetch
    const blobMock = new Blob(['fake data'], {type: 'image/png'});
    const responseMock = new Response(blobMock);

    spyOn(window, 'fetch').and.resolveTo(responseMock);

    await component.download();

    expect(fetch).toHaveBeenCalledWith('https://example.com/image.png');
    expect(certificateServiceMock.download).toHaveBeenCalledWith('CERT123', blobMock);
  });
});
