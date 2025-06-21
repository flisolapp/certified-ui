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
    spyOn(EventEmitterService, 'get').and.callFake(() => new EventEmitter<any>());
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
});
