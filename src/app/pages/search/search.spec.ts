import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Search } from './search';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, ReplaySubject, throwError } from 'rxjs';

import { TermService } from '../../services/term/term-service';
import { EventEmitterService } from '../../services/event-emitter/event-emitter-service';
import { ScrollService } from '../../services/scroll/scroll-service';
import { UuidService } from '../../services/uuid/uuid-service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../forms/custom-validators/custom-validators';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;

  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let translateMock: { get: ReturnType<typeof vi.fn> };

  let paramMapSubject: ReplaySubject<any>;

  const eventEmitters: Record<string, EventEmitter<any>> = {
    searching: new EventEmitter<any>(),
    'search-items-not-found': new EventEmitter<any>(),
    'search-clear': new EventEmitter<any>(),
    'search-result-do-search': new EventEmitter<any>()
  };

  const originalRAF = globalThis.requestAnimationFrame;

  beforeEach(async () => {
    // Make focus callback run deterministically in tests
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0 as any);
      return 0 as any;
    }) as any;

    paramMapSubject = new ReplaySubject(1);

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    snackBarMock = {
      open: vi.fn().mockReturnValue({ dismiss: vi.fn() })
    };

    translateMock = {
      // component calls: translate.get([...]).subscribe(...)
      get: vi.fn().mockReturnValue(of({}))
    };

    // Make CustomValidators.term always pass (we are not testing validator here)
    vi.spyOn(CustomValidators as any, 'term').mockImplementation(() => null);

    // Emit BEFORE component creation (same as your Jasmine test)
    paramMapSubject.next({
      get: () => 'test-term'
    });

    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateMock }
      ]
    })
      // IMPORTANT: Avoid template rendering (TranslatePipe + material view concerns)
      .overrideComponent(Search, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;

    vi.spyOn(ScrollService, 'toTop').mockImplementation(() => {
    });
    vi.spyOn(EventEmitterService, 'get').mockImplementation((name: string) => eventEmitters[name]);
    vi.spyOn(TermService, 'prepare').mockReturnValue('mock-term');
    vi.spyOn(UuidService, 'generateUUID').mockReturnValue('mock-uuid');

    localStorage.clear();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    vi.restoreAllMocks();
  });

  it('should create', () => {
    // no need to detectChanges because we override template
    expect(component).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should set form control value on paramMap', async () => {
      await component.ngOnInit();
      expect(component.termFormControl.value).toBe('test-term');
    });

    it('should set searching to true when termFormControl is valid during ngOnInit', async () => {
      // emit a new param value
      paramMapSubject.next({
        get: () => 'validemail@example.com'
      });

      await component.ngOnInit();

      expect(component.searching()).toBe(true);
    });

    it('should not throw if paramMap retrieval fails', async () => {
      // replace subject with one that errors
      const errorRoute = { paramMap: throwError(() => new Error('boom')) };
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [Search],
        providers: [
          provideZonelessChangeDetection(),
          { provide: ActivatedRoute, useValue: errorRoute as any },
          { provide: Router, useValue: routerMock },
          { provide: MatSnackBar, useValue: snackBarMock },
          { provide: TranslateService, useValue: translateMock }
        ]
      })
        .overrideComponent(Search, { set: { template: '' } })
        .compileComponents();

      const f = TestBed.createComponent(Search);
      const c = f.componentInstance;

      await expect(c.ngOnInit()).resolves.toBeUndefined();
    });
  });

  describe('doSearch', () => {
    it('should perform search, navigate, emit event, and save history', () => {
      component.doSearch('test-search');

      expect(ScrollService.toTop).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'mock-term']);

      // event emitted
      // (we don’t need to subscribe, only verify that emitter exists and has emitted)
      // easiest: spy on emitter.emit
      const emitSpy = vi.spyOn(eventEmitters['search-result-do-search'], 'emit');
      component.doSearch('test-search-2');
      expect(emitSpy).toHaveBeenCalledWith('mock-term');

      const history = localStorage.getItem('flisolapp.History');
      expect(history).toContain('mock-term');
    });

    it('should dismiss snackbar if it exists before search', () => {
      const dismissSpy = vi.fn();
      (component as any).snackBarRef = { dismiss: dismissSpy };

      component.doSearch('test-search');

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should handle TermService.prepare throwing error and show snackbar', () => {
      // translate.get returns the translations used in snackBar.open
      translateMock.get.mockReturnValue(
        of({ 'search.error.-3': 'Invalid', 'common.ok': 'OK' })
      );

      (TermService.prepare as any).mockImplementation(() => {
        throw { message: 'Invalid term', cause: -3 };
      });

      component.doSearch('bad-term');

      expect(snackBarMock.open).toHaveBeenCalledWith('Invalid', 'OK', { duration: 3000 });
    });

    it('should set searching/showHistory and focus on search-items-not-found event', async () => {
      const focusSpy = vi.spyOn(component as any, 'setFocusOnTermInputField');

      await component.ngOnInit();

      component.searching.set(true);
      component.showHistory.set(true);

      eventEmitters['search-items-not-found'].emit();

      expect(component.searching()).toBe(false);
      expect(component.showHistory()).toBe(false);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should clear term and reset signals on search-clear event', async () => {
      const focusSpy = vi.spyOn(component as any, 'setFocusOnTermInputField');

      await component.ngOnInit();

      component.termFormControl.setValue('something');
      component.searching.set(true);
      component.showHistory.set(false);

      eventEmitters['search-clear'].emit();

      expect(component.termFormControl.value).toBeNull();
      expect(component.searching()).toBe(false);
      expect(component.showHistory()).toBe(true);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should set searching signal when searching event is emitted', async () => {
      await component.ngOnInit();

      expect(component.searching()).toBe(true);

      eventEmitters['searching'].emit(false);
      expect(component.searching()).toBe(false);

      eventEmitters['searching'].emit(true);
      expect(component.searching()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should call doSearch if form is valid', () => {
      const spy = vi.spyOn(component, 'doSearch').mockImplementation(() => {
      });
      component.termFormControl.setValue('validemail@example.com');

      // ensure valid
      component.termFormControl.updateValueAndValidity();
      expect(component.termFormControl.valid).toBe(true);

      const event = new Event('submit');
      const preventSpy = vi.spyOn(event, 'preventDefault');

      component.onSubmit(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('validemail@example.com');
    });

    it('should not call doSearch if form is invalid', () => {
      const spy = vi.spyOn(component, 'doSearch').mockImplementation(() => {
      });
      component.termFormControl.setValue(''); // invalid (required)

      component.termFormControl.updateValueAndValidity();
      expect(component.termFormControl.valid).toBe(false);

      component.onSubmit(new Event('submit'));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean subscriptions correctly', () => {
      const sub1 = { unsubscribe: vi.fn() };
      const sub2 = { unsubscribe: vi.fn() };
      (component as any).subscriptions = [sub1, sub2];

      component.ngOnDestroy();

      expect(sub1.unsubscribe).toHaveBeenCalled();
      expect(sub2.unsubscribe).toHaveBeenCalled();
      expect((component as any).subscriptions).toEqual([]);
    });
  });

  describe('history load/save helpers', () => {
    it('should load history from localStorage and set it to signal', () => {
      const mockHistory = [
        { id: 'mock-uuid', term: 'test-term', searched: new Date().toISOString() }
      ];

      localStorage.setItem('flisolapp.History', JSON.stringify(mockHistory));

      (component as any).loadHistory();

      expect(component.history()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'mock-uuid', term: 'test-term' })
        ])
      );
    });

    it('should filter out existing term (case-insensitive) before saving', () => {
      component.history.set([
        { id: 'old-uuid', term: 'Old Term', searched: new Date() } as any
      ]);

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      (component as any).saveHistory('old term'); // same term different case

      const historyResult = component.history();
      expect(historyResult.length).toBe(1);
      expect(historyResult[0].term).toBe('old term');
      expect(setItemSpy).toHaveBeenCalled();
    });

    it('should not save history if term is empty', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      (component as any).saveHistory('');

      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });
});
