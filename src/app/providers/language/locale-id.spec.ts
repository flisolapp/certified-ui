import {LocaleId} from './locale-id';
import {LanguageService} from '../../services/language/language.service';

describe('LocaleId', () => {
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(() => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', [], {locale: 'en-US'});
  });

  it('should create an instance of LocaleId', () => {
    const localeId = new LocaleId(languageServiceMock);
    expect(localeId).toBeTruthy();
    expect(localeId instanceof String).toBeTrue();
  });

  it('toString should return languageService.locale', () => {
    const localeId = new LocaleId(languageServiceMock);
    expect(localeId.toString()).toBe('en-US');
  });

  it('valueOf should return the same as toString', () => {
    const localeId = new LocaleId(languageServiceMock);
    expect(localeId.valueOf()).toBe('en-US');
  });
});
