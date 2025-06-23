import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResultTable} from './search-result-table';
import {provideZonelessChangeDetection} from '@angular/core';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CertificateService} from '../../../../services/certificate/certificate-service';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {CertificateElement} from '../../../../models/certificate-element/certificate-element';

describe('SearchResultTable', () => {
  let component: SearchResultTable;
  let fixture: ComponentFixture<SearchResultTable>;
  let certificateServiceMock: jasmine.SpyObj<CertificateService>;
  let clipboardMock: jasmine.SpyObj<Clipboard>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  const mockCertificate: CertificateElement = {
    edition: '2024',
    unit: {
      name: 'Unit Test',
      acronym: 'UT'
    },
    name: 'Test User',
    enjoyedAs: 'Participant',
    code: '123',
    download: 'http://example.com',
  };

  beforeEach(async () => {
    certificateServiceMock = jasmine.createSpyObj('CertificateService', ['certificate']);
    clipboardMock = jasmine.createSpyObj('Clipboard', ['copy']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        SearchResultTable,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ActivatedRoute, useValue: {paramMap: of({get: () => 'test-term'})}},
        {provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])},
        {provide: CertificateService, useValue: certificateServiceMock},
        {provide: Clipboard, useValue: clipboardMock},
        {provide: MatSnackBar, useValue: snackBarMock},
        {provide: MatDialog, useValue: dialogMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy code to clipboard and show snackbar', () => {
    component.doCopyCodeToClipboard(mockCertificate);

    expect(clipboardMock.copy).toHaveBeenCalledWith(`${window.location.origin}/${mockCertificate.code}`);
    expect(snackBarMock.open).toHaveBeenCalledWith(`common.copied: ${window.location.origin}/${mockCertificate.code}`,
      undefined, {duration: 1000});
  });

  it('should preview image and open dialog', async () => {
    const item: CertificateElement = {code: 'XYZ789'} as CertificateElement;
    const blobMock = new Blob(['fake data'], {type: 'image/png'});
    const dialogRefMock = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef',
      ['afterClosed']);

    certificateServiceMock.certificate.and.resolveTo(blobMock);
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(true));

    const urlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob://fake-url');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');

    await component.doPreview(item);

    expect(certificateServiceMock.certificate).toHaveBeenCalledWith('XYZ789');
    expect(urlSpy).toHaveBeenCalledWith(blobMock);
    expect(dialogMock.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
      data: {imageUrl: 'blob://fake-url', code: 'XYZ789'},
      width: '800px'
    }));
    expect(revokeSpy).toHaveBeenCalledWith('blob://fake-url');
    expect(component.downloadingItem()).toBeNull();
  });
});
