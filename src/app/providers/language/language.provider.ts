import {LOCALE_ID, Provider} from '@angular/core';
import {LanguageService} from '../../services/language/language.service';

export class LocaleId extends String {

  constructor(private languageService: LanguageService) {
    super();
  }

  override toString(): string {
    return this.languageService.locale;
  }

  override valueOf(): string {
    return this.toString();
  }

}

export const LanguageProvider: Provider = {
  provide: LOCALE_ID,
  useClass: LocaleId,
  deps: [LanguageService]
};
