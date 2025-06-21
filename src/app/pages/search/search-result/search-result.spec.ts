import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResult} from './search-result';
import {ActivatedRoute, Router} from '@angular/router';
import {CertificateService} from '../../../services/certificate/certificate-service';
import {TranslateService} from '@ngx-translate/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter-service';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {EventEmitter, provideZonelessChangeDetection} from '@angular/core';

describe('SearchResult', () => {
  let component: SearchResult;
  let fixture: ComponentFixture<SearchResult>;
  let certificateServiceMock: jasmine.SpyObj<CertificateService>;
  let clipboardMock: jasmine.SpyObj<Clipboard>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let afterClosedSubject: Subject<boolean>;

  const mockCertificate: CertificateElement = {
    edition: '2024',
    unit: 'Unit Test',
    name: 'Test User',
    enjoyedAs: 'Participant',
    code: '123',
    download: 'http://example.com',
  };

  beforeEach(async () => {
    certificateServiceMock = jasmine.createSpyObj('CertificateService', ['search', 'download']);
    clipboardMock = jasmine.createSpyObj('Clipboard', ['copy']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    afterClosedSubject = new Subject<boolean>();

    await TestBed.configureTestingModule({
      imports: [SearchResult],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ActivatedRoute, useValue: {paramMap: of({get: () => 'test-term'})}},
        {provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])},
        {provide: CertificateService, useValue: certificateServiceMock},
        {provide: TranslateService, useValue: {get: () => of({'common.copied': 'Copied'})}},
        {provide: Clipboard, useValue: clipboardMock},
        {provide: MatSnackBar, useValue: snackBarMock},
        {provide: MatDialog, useValue: dialogMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResult);
    component = fixture.componentInstance;

    spyOn(EventEmitterService, 'get').and.callFake(() => new EventEmitter<any>());
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should perform search and set dataSource', async () => {
    certificateServiceMock.search.and.returnValue(of([mockCertificate]));
    await component.doSearch('123'); // Simula o delay do setTimeout

    expect(component.dataSource().length).toBe(1);
    expect(component.dataSource()[0]).toEqual(mockCertificate);
  });

  it('should copy code to clipboard and show snackbar', () => {
    component.doCopyCodeToClipboard(mockCertificate);

    expect(clipboardMock.copy).toHaveBeenCalledWith(window.location.origin + '/' + mockCertificate.code);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Copied: ' + window.location.origin + '/' + mockCertificate.code,
      undefined,
      {duration: 1000}
    );
  });

  it('should handle download after dialog confirmation', async () => {
    dialogMock.open.and.returnValue({afterClosed: () => afterClosedSubject} as unknown as MatDialogRef<any>);
    // @ts-ignore
    certificateServiceMock.download.and.returnValue(Promise.resolve(null));

    await component.doDownload(mockCertificate); // Avança o tempo para resolver o Promise
    afterClosedSubject.next(true);

    expect(certificateServiceMock.download).toHaveBeenCalledWith(mockCertificate.code);
  });

  it('should clear search', async () => {
    const routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    await component.doClear(); // Garante execução da Promise do navigate

    expect(component.dataSource()).toEqual([]);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
