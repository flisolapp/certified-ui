import { LanguageService } from './language.service';
import { TranslateService } from '@ngx-translate/core';
import { EventEmitterService } from '../event-emitter/event-emitter.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;
  let eventEmitterSpy: jasmine.SpyObj<any>;

  beforeEach(() => {
    translateServiceMock = jasmine.createSpyObj('TranslateService', [
      'getBrowserLang',
      'addLangs',
      'use',
      'setDefaultLang'
    ]);

    // Mock EventEmitter
    eventEmitterSpy = jasmine.createSpyObj('EventEmitter', ['emit']);
    spyOn(EventEmitterService, 'get').and.returnValue(eventEmitterSpy);

    service = new LanguageService(translateServiceMock);

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('locale getter and setter', () => {
    it('should set and get locale', () => {
      service.locale = 'pt-BR';
      expect(service.locale).toBe('pt-BR');
    });

    it('should return default "en" if locale is falsy', () => {
      (service as any)._locale = '';
      expect(service.locale).toBe('en');
    });
  });

  describe('getLanguages', () => {
    it('should return available languages', () => {
      const langs = service.getLanguages();
      expect(langs.length).toBe(3);
      expect(langs[0].code).toBe('en');
    });
  });

  describe('init', () => {
    it('should initialize language from browserLang pt', () => {
      translateServiceMock.getBrowserLang.and.returnValue('pt');

      service.init();

      expect(translateServiceMock.addLangs).toHaveBeenCalledWith(['en', 'pt-BR']);
      expect(translateServiceMock.use).toHaveBeenCalledWith('pt-BR');
      expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('pt-BR');
      expect(localStorage.getItem('flisolapp.Language')).toContain('"code":"pt-BR"');
      expect(eventEmitterSpy.emit).toHaveBeenCalledWith('pt-BR');
    });

    it('should initialize language from saved localStorage', () => {
      const savedLang = { name: 'Español (España)', code: 'es', flag: 'ES' };
      localStorage.setItem('flisolapp.Language', JSON.stringify(savedLang));

      translateServiceMock.getBrowserLang.and.returnValue('es');

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith('es');
      expect(eventEmitterSpy.emit).toHaveBeenCalledWith('es');
    });

    it('should handle malformed localStorage gracefully', () => {
      localStorage.setItem('flisolapp.Language', 'invalid-json');
      translateServiceMock.getBrowserLang.and.returnValue('en');

      expect(() => service.init()).not.toThrow();
    });

    it('should not initialize if getBrowserLang returns undefined', () => {
      translateServiceMock.getBrowserLang.and.returnValue(undefined);

      service.init();

      expect(translateServiceMock.addLangs).not.toHaveBeenCalled();
    });
  });

  describe('getSelected and setSelected', () => {
    it('should return selected language', () => {
      (service as any).selected = { code: 'en' };
      expect(service.getSelected()).toEqual({ code: 'en' });
    });

    it('should set selected language and emit event', () => {
      const lang = { code: 'es', name: 'Español', flag: 'ES' };
      service.setSelected(lang);

      expect(translateServiceMock.use).toHaveBeenCalledWith('es');
      expect(localStorage.getItem('flisolapp.Language')).toContain('"code":"es"');
      expect(eventEmitterSpy.emit).toHaveBeenCalledWith('es');
    });
  });

  describe('getLanguageCode (static)', () => {
    it('should return code from localStorage', () => {
      localStorage.setItem('flisolapp.Language', JSON.stringify({ code: 'pt-BR' }));
      expect(LanguageService.getLanguageCode()).toBe('pt-BR');
    });

    it('should return empty string if no language saved', () => {
      expect(LanguageService.getLanguageCode()).toBe('');
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('flisolapp.Language', 'invalid-json');
      expect(LanguageService.getLanguageCode()).toBe('');
    });
  });

});
