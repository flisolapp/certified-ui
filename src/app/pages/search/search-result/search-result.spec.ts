import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResult} from './search-result';
import {ActivatedRoute, Router} from '@angular/router';
import {CertificateService} from '../../../services/certificate/certificate-service';
import {TranslateService} from '@ngx-translate/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {EventEmitterService} from '../../../services/event-emitter/event-emitter-service';
import {CertificateElement} from '../../../models/certificate-element/certificate-element';
import {EventEmitter, provideZonelessChangeDetection} from '@angular/core';
import {ScrollService} from '../../../services/scroll/scroll-service';

describe('SearchResult', (): void => {
  let component: SearchResult;
  let fixture: ComponentFixture<SearchResult>;
  let certificateServiceMock: jasmine.SpyObj<CertificateService>;
  let clipboardMock: jasmine.SpyObj<Clipboard>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  const eventEmitters: Record<string, EventEmitter<any>> = {
    'search-result-do-search': new EventEmitter<any>(),
    'search-items-not-found': new EventEmitter<any>()
  };
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

    spyOn(EventEmitterService, 'get').and.callFake((eventName: string) => eventEmitters[eventName] || new EventEmitter<any>());
  });

  afterEach((): void => {
    fixture.destroy();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should call doSearch on ngOnInit when term exists in paramMap', async (): Promise<void> => {
    spyOn(ScrollService, 'toTop');
    const doSearchSpy = spyOn(component, 'doSearch').and.resolveTo();

    await component.ngOnInit();

    expect(ScrollService.toTop).toHaveBeenCalled();
    expect(doSearchSpy).toHaveBeenCalledWith('test-term');
  });

  it('should call doSearch on ngOnInit when term exists in paramMap', async (): Promise<void> => {
    spyOn(ScrollService, 'toTop');
    const doSearchSpy = spyOn(component, 'doSearch').and.resolveTo();

    await component.ngOnInit();

    expect(ScrollService.toTop).toHaveBeenCalled();
    expect(doSearchSpy).toHaveBeenCalledWith('test-term');
  });

  it('should subscribe to search-result-do-search and trigger doSearch when emitted', async (): Promise<void> => {
    const doSearchSpy = spyOn(component, 'doSearch').and.resolveTo();

    await component.ngOnInit();

    eventEmitters['search-result-do-search'].emit('new-term');

    // Wait for event loop to ensure execution of async subscription
    await Promise.resolve();

    expect(doSearchSpy).toHaveBeenCalledWith('new-term');
  });

  it('should unsubscribe all subscriptions when disposeSubscriptions is called', () => {
    const unsubscribeSpy1 = jasmine.createSpy('unsubscribe');
    const unsubscribeSpy2 = jasmine.createSpy('unsubscribe');

    (component as any).subscriptions = [
      {unsubscribe: unsubscribeSpy1},
      {unsubscribe: unsubscribeSpy2}
    ];

    (component as any).disposeSubscriptions();

    expect(unsubscribeSpy1).toHaveBeenCalled();
    expect(unsubscribeSpy2).toHaveBeenCalled();
    expect((component as any).subscriptions.length).toBe(0);
  });

  it('should perform search and set dataSource', async (): Promise<void> => {
    certificateServiceMock.search.and.returnValue(of([mockCertificate]));
    await component.doSearch('123'); // Simula o delay do setTimeout

    expect(component.dataSource().length).toBe(1);
    expect(component.dataSource()[0]).toEqual(mockCertificate);
  });

  it('should handle error in doSearch and emit search-items-not-found if dataSource is empty', async (): Promise<void> => {
    spyOn(eventEmitters['search-items-not-found'], 'emit');

    certificateServiceMock.search.and.returnValue(throwError(() => new Error('Search failed')));

    await component.doSearch('failing-term');

    expect(component.searching()).toBeFalse();
    expect(eventEmitters['search-items-not-found'].emit).toHaveBeenCalled();
  });

  it('should emit search-items-not-found when search returns empty array', async () => {
    spyOn(eventEmitters['search-items-not-found'], 'emit');
    certificateServiceMock.search.and.returnValue(of([]));

    await component.doSearch('empty-term');

    expect(eventEmitters['search-items-not-found'].emit).toHaveBeenCalled();
  });

  it('should clear search', async (): Promise<void> => {
    const routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    // Ensures the execution of the navigate Promise
    await component.doClear();

    expect(component.dataSource()).toEqual([]);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should reflect searching state in isStatusSearching', () => {
    component.searching.set(true);
    expect(component.isStatusSearching()).toBeTrue();

    component.searching.set(false);
    expect(component.isStatusSearching()).toBeFalse();
  });

  it('should return true for isStatusItemsNotFound when searched=true, searching=false, and dataSource empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([]);

    expect(component.isStatusItemsNotFound()).toBeTrue();
  });

  it('should return false for isStatusItemsNotFound when searching=true', () => {
    component.searched.set(true);
    component.searching.set(true);
    component.dataSource.set([]);

    expect(component.isStatusItemsNotFound()).toBeFalse();
  });

  it('should return false for isStatusItemsNotFound when dataSource is not empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([mockCertificate]);

    expect(component.isStatusItemsNotFound()).toBeFalse();
  });

  it('should return true for isStatusItemsFound when searched=true, searching=false, and dataSource has items', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([mockCertificate]);

    expect(component.isStatusItemsFound()).toBeTrue();
  });

  it('should return false for isStatusItemsFound when dataSource is empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([]);

    expect(component.isStatusItemsFound()).toBeFalse();
  });
});
