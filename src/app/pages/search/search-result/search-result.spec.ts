import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchResult } from './search-result';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { PlatformService } from '../../../services/platform/platform-service';
import { EventEmitterService } from '../../../services/event-emitter/event-emitter-service';
import { ScrollService } from '../../../services/scroll/scroll-service';

import { of, ReplaySubject, throwError } from 'rxjs';
import { CertificateElement } from '../../../models/certificate-element/certificate-element';

describe('SearchResult', () => {
  let component: SearchResult;
  let fixture: ComponentFixture<SearchResult>;

  let routeParamMap$: ReplaySubject<any>;

  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let certificateServiceMock: { search: ReturnType<typeof vi.fn> };
  let platformServiceMock: {
    isDesktop: ReturnType<typeof vi.fn>;
    isMobile: ReturnType<typeof vi.fn>;
  };

  const eventEmitters: Record<string, EventEmitter<any>> = {
    'search-result-do-search': new EventEmitter<any>(),
    'search-items-not-found': new EventEmitter<any>(),
    searching: new EventEmitter<any>(),
    'search-clear': new EventEmitter<any>(),
  };

  const mockCertificate: CertificateElement = {
    edition: '2024',
    unit: { name: 'Unit Test', acronym: 'UT' },
    name: 'Test User',
    enjoyedAs: 'Participant',
    code: '123',
    download: 'http://example.com',
  } as any;

  beforeEach(async () => {
    routeParamMap$ = new ReplaySubject(1);

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    certificateServiceMock = {
      search: vi.fn().mockReturnValue(of([])),
    };

    platformServiceMock = {
      isDesktop: vi.fn().mockReturnValue(true),
      isMobile: vi.fn().mockReturnValue(false),
    };

    // Emit term BEFORE component init
    routeParamMap$.next({ get: () => 'test-term' });

    await TestBed.configureTestingModule({
      imports: [SearchResult],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: { paramMap: routeParamMap$.asObservable() } },
        { provide: Router, useValue: routerMock },
        { provide: CertificateService, useValue: certificateServiceMock },
        { provide: PlatformService, useValue: platformServiceMock },
      ],
    })
      // Prevent template execution (TranslatePipe / child components irrelevant for unit tests)
      .overrideComponent(SearchResult, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchResult);
    component = fixture.componentInstance;

    vi.spyOn(ScrollService, 'toTop').mockImplementation(() => {});
    vi.spyOn(EventEmitterService, 'get').mockImplementation((eventName: string) => {
      return eventEmitters[eventName] ?? new EventEmitter<any>();
    });
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should call doSearch on ngOnInit when term exists in paramMap', async () => {
    const doSearchSpy = vi.spyOn(component, 'doSearch').mockResolvedValue();

    await component.ngOnInit();

    expect(ScrollService.toTop).toHaveBeenCalled();
    expect(doSearchSpy).toHaveBeenCalledWith('test-term');
  });

  it('should subscribe to search-result-do-search and trigger doSearch when emitted', async () => {
    const doSearchSpy = vi.spyOn(component, 'doSearch').mockResolvedValue();

    await component.ngOnInit();

    eventEmitters['search-result-do-search'].emit('new-term');

    // flush microtask created by async subscription callback
    await Promise.resolve();

    expect(doSearchSpy).toHaveBeenCalledWith('new-term');
  });

  it('should unsubscribe doSearchSubscription on ngOnDestroy', async () => {
    await component.ngOnInit();

    const unsubscribeSpy = vi.fn();
    (component as any).doSearchSubscription = { unsubscribe: unsubscribeSpy };

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should unsubscribe all subscriptions when disposeSubscriptions is called', () => {
    const unsubscribeSpy1 = vi.fn();
    const unsubscribeSpy2 = vi.fn();

    (component as any).subscriptions = [
      { unsubscribe: unsubscribeSpy1 },
      { unsubscribe: unsubscribeSpy2 },
    ];

    (component as any).disposeSubscriptions();

    expect(unsubscribeSpy1).toHaveBeenCalled();
    expect(unsubscribeSpy2).toHaveBeenCalled();
    expect((component as any).subscriptions).toEqual([]);
  });

  it('should perform search and set dataSource', async () => {
    certificateServiceMock.search.mockReturnValue(of([mockCertificate]));

    await component.doSearch('123');

    expect(component.searched()).toBe(true);
    expect(component.searching()).toBe(false);
    expect(component.dataSource()).toHaveLength(1);
    expect(component.dataSource()[0]).toEqual(mockCertificate);
  });

  it('should emit searching=true at start of doSearch', async () => {
    const searchingEmitSpy = vi.spyOn(eventEmitters['searching'], 'emit');
    certificateServiceMock.search.mockReturnValue(of([mockCertificate]));

    await component.doSearch('term');

    expect(searchingEmitSpy).toHaveBeenCalledWith(true);
  });

  it('should handle error in doSearch and emit search-items-not-found if dataSource is empty', async () => {
    const notFoundEmitSpy = vi.spyOn(eventEmitters['search-items-not-found'], 'emit');

    certificateServiceMock.search.mockReturnValue(throwError(() => new Error('Search failed')));

    await component.doSearch('failing-term');

    expect(component.searching()).toBe(false);
    expect(notFoundEmitSpy).toHaveBeenCalled();
  });

  it('should emit search-items-not-found when search returns empty array', async () => {
    const notFoundEmitSpy = vi.spyOn(eventEmitters['search-items-not-found'], 'emit');
    certificateServiceMock.search.mockReturnValue(of([]));

    await component.doSearch('empty-term');

    expect(component.searching()).toBe(false);
    expect(component.dataSource()).toEqual([]);
    expect(notFoundEmitSpy).toHaveBeenCalled();
  });

  it('should clear search and navigate home', async () => {
    const clearEmitSpy = vi.spyOn(eventEmitters['search-clear'], 'emit');

    component.searched.set(true);
    component.searching.set(true);
    component.dataSource.set([mockCertificate]);

    await component.doClear();

    expect(component.searched()).toBe(false);
    expect(component.searching()).toBe(false);
    expect(component.dataSource()).toEqual([]);

    expect(clearEmitSpy).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should reflect searching state in isStatusSearching', () => {
    component.searching.set(true);
    expect(component.isStatusSearching()).toBe(true);

    component.searching.set(false);
    expect(component.isStatusSearching()).toBe(false);
  });

  it('should return true for isStatusItemsNotFound when searched=true, searching=false, and dataSource empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([]);

    expect(component.isStatusItemsNotFound()).toBe(true);
  });

  it('should return false for isStatusItemsNotFound when searching=true', () => {
    component.searched.set(true);
    component.searching.set(true);
    component.dataSource.set([]);

    expect(component.isStatusItemsNotFound()).toBe(false);
  });

  it('should return false for isStatusItemsNotFound when dataSource is not empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([mockCertificate]);

    expect(component.isStatusItemsNotFound()).toBe(false);
  });

  it('should return true for isStatusItemsFound when searched=true, searching=false, and dataSource has items', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([mockCertificate]);

    expect(component.isStatusItemsFound()).toBe(true);
  });

  it('should return false for isStatusItemsFound when dataSource is empty', () => {
    component.searched.set(true);
    component.searching.set(false);
    component.dataSource.set([]);

    expect(component.isStatusItemsFound()).toBe(false);
  });
});
