import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { LanguageService } from '../../services/language/language.service';
import { Component } from '@angular/core';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';

// Mock TranslatePipe to avoid real translation logic
@Component({
  selector: 'span[translate]',
  template: ''
})
class MockTranslatePipe {}

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', ['getSelected', 'setSelected', 'getLanguages']);

    languageServiceMock.getSelected.and.returnValue({ code: 'en', name: 'English', flag: 'EN' });
    languageServiceMock.getLanguages.and.returnValue([
      { code: 'en', name: 'English', flag: 'EN' },
      { code: 'pt-BR', name: 'Português', flag: 'BR' }
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ToolbarComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;

    // Ensure language is initialized to avoid template errors
    component.language = { code: 'en', name: 'English', flag: 'EN' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call detectAndLoadColorScheme and set language', () => {
      spyOn(component, 'detectAndLoadColorScheme').and.callThrough();
      component.ngOnInit();
      expect(component.detectAndLoadColorScheme).toHaveBeenCalled();
      expect(component.language).toEqual({ code: 'en', name: 'English', flag: 'EN' });
    });
  });

  describe('detectAndLoadColorScheme', () => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
      spyOn(component as any, 'applyColorScheme').and.callThrough();
    });

    it('should detect dark mode from system preference', () => {
      localStorage.removeItem('flisolapp.DarkMode');
      component.detectAndLoadColorScheme();
      expect(component.darkMode).toBeTrue();
    });

    it('should override dark mode if localStorage is set to false', () => {
      localStorage.setItem('flisolapp.DarkMode', 'false');
      component.detectAndLoadColorScheme();
      expect(component.darkMode).toBeFalse();
    });

    it('should override dark mode if localStorage is set to true', () => {
      localStorage.setItem('flisolapp.DarkMode', 'true');
      component.detectAndLoadColorScheme();
      expect(component.darkMode).toBeTrue();
    });

    it('should call applyColorScheme', () => {
      component.detectAndLoadColorScheme();
      expect((component as any).applyColorScheme).toHaveBeenCalled();
    });
  });

  describe('toggleColorScheme', () => {
    beforeEach(() => {
      spyOn(component as any, 'applyColorScheme');
    });

    it('should toggle darkMode and update localStorage', () => {
      component.darkMode = false;
      component.toggleColorScheme();
      expect(component.darkMode).toBeTrue();
      expect(localStorage.getItem('flisolapp.DarkMode')).toBe('true');

      component.toggleColorScheme();
      expect(component.darkMode).toBeFalse();
      expect(localStorage.getItem('flisolapp.DarkMode')).toBe('false');
    });

    it('should call applyColorScheme on toggle', () => {
      component.toggleColorScheme();
      expect((component as any).applyColorScheme).toHaveBeenCalled();
    });
  });

  describe('applyColorScheme', () => {
    it('should add darkMode class when darkMode is true', () => {
      component.darkMode = true;
      const addSpy = spyOn(document.body.classList, 'add');
      component['applyColorScheme']();
      expect(addSpy).toHaveBeenCalledWith('darkMode');
    });

    it('should remove darkMode class when darkMode is false', () => {
      component.darkMode = false;
      const removeSpy = spyOn(document.body.classList, 'remove');
      component['applyColorScheme']();
      expect(removeSpy).toHaveBeenCalledWith('darkMode');
    });
  });

  describe('selectLanguage', () => {
    it('should set language and call languageService.setSelected', () => {
      const lang = { code: 'pt-BR', name: 'Português', flag: 'BR' };
      component.selectLanguage(lang);
      expect(component.language).toEqual(lang);
      expect(languageServiceMock.setSelected).toHaveBeenCalledWith(lang);
    });
  });

});
