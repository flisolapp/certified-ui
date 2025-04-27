import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { LanguageProvider } from './language-provider';
import { LanguageService } from '../../services/language/language.service';
import { LocaleId } from './locale-id';

describe('LanguageProvider', () => {
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(() => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', [], { locale: 'pt-BR' });

    TestBed.configureTestingModule({
      providers: [
        LanguageProvider,
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    });
  });

  it('should provide LOCALE_ID using LocaleId class', () => {
    const localeId = TestBed.inject(LOCALE_ID);

    expect(localeId).toBeInstanceOf(LocaleId);
    expect(localeId.toString()).toBe('pt-BR');
  });
});
