import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResult} from './search-result';
import {ActivatedRoute, Router} from '@angular/router';
import {CertificateService} from '../../../services/certificate/certificate-service';
import {TranslateService} from '@ngx-translate/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter-service';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {EventEmitter, provideZonelessChangeDetection} from '@angular/core';

describe('SearchResult', (): void => {
  let component: SearchResult;
  let fixture: ComponentFixture<SearchResult>;
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

  beforeEach(async (): Promise<void> => {
    certificateServiceMock = jasmine.createSpyObj('CertificateService', ['search', 'download']);
    clipboardMock = jasmine.createSpyObj('Clipboard', ['copy']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

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

    spyOn(EventEmitterService, 'get').and.callFake((): EventEmitter<any> => new EventEmitter<any>());
  });

  afterEach((): void => {
    fixture.destroy();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should perform search and set dataSource', async (): Promise<void> => {
    certificateServiceMock.search.and.returnValue(of([mockCertificate]));
    await component.doSearch('123'); // Simula o delay do setTimeout

    expect(component.dataSource().length).toBe(1);
    expect(component.dataSource()[0]).toEqual(mockCertificate);
  });

  it('should clear search', async (): Promise<void> => {
    const routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    // Ensures the execution of the navigate Promise
    await component.doClear();

    expect(component.dataSource()).toEqual([]);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
