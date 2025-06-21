import {TestBed} from '@angular/core/testing';
import {App} from './app';
import {RouterOutlet} from '@angular/router';
import {LanguageService} from './services/language/language-service';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideZonelessChangeDetection} from '@angular/core';

describe('App', () => {
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', ['init']);

    await TestBed.configureTestingModule({
      imports: [
        App,
        RouterOutlet,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: LanguageService, useValue: languageServiceMock}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call languageService.init() on construction', () => {
    TestBed.createComponent(App);
    expect(languageServiceMock.init).toHaveBeenCalled();
  });
});
