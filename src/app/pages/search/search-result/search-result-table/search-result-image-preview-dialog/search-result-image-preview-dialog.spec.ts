import {TestBed} from '@angular/core/testing';
import {SearchResultImagePreviewDialog} from './search-result-image-preview-dialog';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';
import {DownloadService} from '../../../../../services/download/download.service';

describe('SearchResultImagePreviewDialog', () => {
  let component: SearchResultImagePreviewDialog;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<SearchResultImagePreviewDialog>>;
  let downloadServiceMock: jasmine.SpyObj<DownloadService>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    downloadServiceMock = jasmine.createSpyObj('DownloadService', ['download']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultImagePreviewDialog,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: DownloadService, useValue: downloadServiceMock},
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

  it('download(): fetches the image blob and delegates to DownloadService', async () => {
    const blobMock = new Blob(['fake data'], {type: 'image/png'});
    const responseMock = new Response(blobMock);

    // Ensure the service returns a resolved promise to await cleanly
    downloadServiceMock.download.and.returnValue(Promise.resolve());

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(responseMock));

    await component.download();

    expect(window.fetch).toHaveBeenCalledOnceWith('https://example.com/image.png');
    expect(downloadServiceMock.download).toHaveBeenCalledOnceWith('CERT123', blobMock);
  });

  it('download(): propagates error when fetch fails and does not call DownloadService', async () => {
    const err = new Error('network down');
    spyOn(window, 'fetch').and.returnValue(Promise.reject(err));

    await expectAsync(component.download()).toBeRejectedWith(err);
    expect(downloadServiceMock.download).not.toHaveBeenCalled();
  });
});
