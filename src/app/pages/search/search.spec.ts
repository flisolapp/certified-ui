import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Search} from './search';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of, ReplaySubject} from 'rxjs';
import {TermService} from '../../services/term/term-service';
import {EventEmitterService} from '../../services/event-emitter/event-emitter-service';
import {ScrollService} from '../../services/scroll/scroll-service';
import {UuidService} from '../../services/uuid/uuid-service';
import {EventEmitter, provideZonelessChangeDetection} from '@angular/core';
import {TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let paramMapSubject: ReplaySubject<any>;

  const eventEmitters: Record<string, EventEmitter<any>> = {
    searching: new EventEmitter<any>(),
    'search-items-not-found': new EventEmitter<any>(),
    'search-clear': new EventEmitter<any>(),
    'search-result-do-search': new EventEmitter<any>()
  };

  beforeEach(async () => {
    paramMapSubject = new ReplaySubject(1);

    await TestBed.configureTestingModule({
      imports: [
        Search,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ActivatedRoute, useValue: {paramMap: paramMapSubject.asObservable()}},
        {provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])},
        {provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open'])}
      ]
    }).compileComponents();

    // Dispara o valor ANTES da criação do componente
    paramMapSubject.next({
      get: () => 'test-term'
    } as any);

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;

    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarMock = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    spyOn(ScrollService, 'toTop');
    spyOn(EventEmitterService, 'get').and.callFake((eventName: string) => eventEmitters[eventName]);
    spyOn(TermService, 'prepare').and.returnValue('mock-term');
    spyOn(UuidService, 'generateUUID').and.returnValue('mock-uuid');

    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set form control value on paramMap', async () => {
      await component.ngOnInit();
      expect(component.termFormControl.value).toBe('test-term');
    });
  });

  describe('doSearch', () => {
    it('should perform search and save history', async () => {
      routerMock.navigate.and.returnValue(Promise.resolve(true));

      component.doSearch('test-search');

      expect(ScrollService.toTop).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'mock-term']);

      const history = localStorage.getItem('flisolapp.History');
      expect(history).toContain('mock-term');
    });

    it('should handle TermService.prepare throwing error', () => {
      const translateService = TestBed.inject(TranslateService);
      spyOn(translateService, 'get').and.returnValue(of({'search.error.-3': 'Invalid', 'common.ok': 'OK'}));

      (TermService.prepare as jasmine.Spy).and.callFake(() => {
        throw {message: 'Invalid term', cause: -3};
      });

      component.doSearch('bad-term');

      expect(snackBarMock.open).toHaveBeenCalledWith('Invalid', 'OK', {duration: 3000});
    });
  });

  describe('onSubmit', () => {
    it('should call doSearch if form is valid', () => {
      const spy = spyOn(component, 'doSearch');
      component.termFormControl.setValue('valid-term');
      component.termFormControl.setErrors(null);  // Força estado válido

      component.onSubmit(new Event('submit'));

      expect(spy).toHaveBeenCalledWith('valid-term');
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean subscriptions correctly', () => {
      const unsubscribeSpy1 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      const unsubscribeSpy2 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      (component as any).subscriptions = [unsubscribeSpy1, unsubscribeSpy2];

      component.ngOnDestroy();

      expect(unsubscribeSpy1.unsubscribe).toHaveBeenCalled();
      expect(unsubscribeSpy2.unsubscribe).toHaveBeenCalled();
    });
  });

  it('should set searching to true when termFormControl is valid during ngOnInit', async () => {
    paramMapSubject.next({
      get: () => 'validemail@example.com'  // Valor que passa pelo CustomValidators.term
    } as any);

    component.termFormControl.setErrors(null);  // Força o estado válido
    await component.ngOnInit();

    expect(component.searching()).toBeTrue();
  });

  it('should dismiss snackbar if it exists before search', () => {
    const dismissSpy = jasmine.createSpy('dismiss');
    (component as any).snackBarRef = {dismiss: dismissSpy} as any;

    component.doSearch('test-search');

    expect(dismissSpy).toHaveBeenCalled();
  });

  it('should load history from localStorage and set it to signal', () => {
    const mockHistory = [{
      id: 'mock-uuid',
      term: 'test-term',
      searched: new Date().toISOString()
    }];

    localStorage.setItem('flisolapp.History', JSON.stringify(mockHistory));

    component['loadHistory']();

    expect(component.history()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        id: 'mock-uuid',
        term: 'test-term'
      })
    ]));
  });

  it('should filter out existing term from history before saving', () => {
    component.history.set([
      {id: 'old-uuid', term: 'Old Term', searched: new Date()}
    ]);

    spyOn(localStorage, 'setItem');

    component['saveHistory']('New Term');

    const historyResult = component.history();

    expect(historyResult.length).toBe(2);
    expect(historyResult.some(item => item.term === 'Old Term')).toBeTrue();
    expect(historyResult.some(item => item.term === 'New Term')).toBeTrue();
  });

  it('should set searching signal when searching event is emitted', async () => {
    await component.ngOnInit();

    expect(component.searching()).toBeFalse();

    eventEmitters['searching'].emit(true);
    expect(component.searching()).toBeTrue();

    eventEmitters['searching'].emit(false);
    expect(component.searching()).toBeFalse();
  });

  it('should handle search-items-not-found event', async () => {
    spyOn<any>(component, 'setFocusOnTermInputField');

    await component.ngOnInit();

    component.searching.set(true);
    component.showHistory.set(true);

    eventEmitters['search-items-not-found'].emit();

    expect(component.searching()).toBeFalse();
    expect(component.showHistory()).toBeFalse();
    expect(component['setFocusOnTermInputField']).toHaveBeenCalled();
  });

  it('should handle search-clear event', async () => {
    spyOn<any>(component, 'setFocusOnTermInputField');

    await component.ngOnInit();

    component.termFormControl.setValue('something');
    component.searching.set(true);
    component.showHistory.set(false);

    eventEmitters['search-clear'].emit();

    expect(component.termFormControl.value).toBeNull();
    expect(component.searching()).toBeFalse();
    expect(component.showHistory()).toBeTrue();
    expect(component['setFocusOnTermInputField']).toHaveBeenCalled();
  });
});
