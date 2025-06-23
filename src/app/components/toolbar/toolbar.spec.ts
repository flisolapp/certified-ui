import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Toolbar} from './toolbar';
import {LanguageService} from '../../services/language/language-service';
import {Component, provideZonelessChangeDetection} from '@angular/core';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import Spy = jasmine.Spy;

// Mock TranslatePipe to avoid real translation logic
@Component({
  selector: 'span[translate]',
  template: ''
})
class MockTranslatePipe {
}

describe('Toolbar', (): void => {
  let component: Toolbar;
  let fixture: ComponentFixture<Toolbar>;
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(async (): Promise<void> => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', ['getSelected', 'setSelected', 'getLanguages']);

    languageServiceMock.getSelected.and.returnValue({code: 'en', name: 'English', flag: 'EN'});
    languageServiceMock.getLanguages.and.returnValue([
      {code: 'en', name: 'English', flag: 'EN'},
      {code: 'pt-BR', name: 'Português', flag: 'BR'}
    ]);

    await TestBed.configureTestingModule({
      imports: [
        Toolbar,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: LanguageService, useValue: languageServiceMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Toolbar);
    component = fixture.componentInstance;

    // Ensure language is initialized to avoid template errors
    component.language.set({code: 'en', name: 'English', flag: 'EN'});

    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', (): void => {
    it('should call detectAndLoadColorScheme and set language', (): void => {
      spyOn(component, 'detectAndLoadColorScheme').and.callThrough();
      component.ngOnInit();
      expect(component.detectAndLoadColorScheme).toHaveBeenCalled();
      expect(component.language()).toEqual({code: 'en', name: 'English', flag: 'EN'});
    });
  });

  describe('detectAndLoadColorScheme', (): void => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
      spyOn(component as any, 'applyColorScheme').and.callThrough();
    });

    it('should detect dark mode from system preference', (): void => {
      localStorage.removeItem('flisolapp.DarkMode');
      component.detectAndLoadColorScheme();
      expect(component.darkMode()).toBeTrue();
    });

    it('should override dark mode if localStorage is set to false', (): void => {
      localStorage.setItem('flisolapp.DarkMode', 'false');
      component.detectAndLoadColorScheme();
      expect(component.darkMode()).toBeFalse();
    });

    it('should override dark mode if localStorage is set to true', (): void => {
      localStorage.setItem('flisolapp.DarkMode', 'true');
      component.detectAndLoadColorScheme();
      expect(component.darkMode()).toBeTrue();
    });

    it('should call applyColorScheme', (): void => {
      component.detectAndLoadColorScheme();
      expect((component as any).applyColorScheme).toHaveBeenCalled();
    });
  });

  describe('toggleColorScheme', (): void => {
    beforeEach(() => {
      spyOn(component as any, 'applyColorScheme');
    });

    it('should toggle darkMode and update localStorage', (): void => {
      component.darkMode.set(false);
      component.toggleColorScheme();
      expect(component.darkMode()).toBeTrue();
      expect(localStorage.getItem('flisolapp.DarkMode')).toBe('true');

      component.toggleColorScheme();
      expect(component.darkMode()).toBeFalse();
      expect(localStorage.getItem('flisolapp.DarkMode')).toBe('false');
    });

    it('should call applyColorScheme on toggle', (): void => {
      component.toggleColorScheme();
      expect((component as any).applyColorScheme).toHaveBeenCalled();
    });
  });

  describe('applyColorScheme', (): void => {
    it('should add darkMode class when darkMode is true', (): void => {
      component.darkMode.set(true);
      const addSpy: Spy<(...tokens: string[]) => void> = spyOn(document.body.classList, 'add');
      component['applyColorScheme']();
      expect(addSpy).toHaveBeenCalledWith('darkMode');
    });

    it('should remove darkMode class when darkMode is false', (): void => {
      component.darkMode.set(false);
      const removeSpy: Spy<(...tokens: string[]) => void> = spyOn(document.body.classList, 'remove');
      component['applyColorScheme']();
      expect(removeSpy).toHaveBeenCalledWith('darkMode');
    });
  });

  describe('selectLanguage', (): void => {
    it('should set language and call languageService.setSelected', (): void => {
      const lang = {code: 'pt-BR', name: 'Português', flag: 'BR'};
      component.selectLanguage(lang);
      expect(component.language()).toEqual(lang);
      expect(languageServiceMock.setSelected).toHaveBeenCalledWith(lang);
    });
  });

});
