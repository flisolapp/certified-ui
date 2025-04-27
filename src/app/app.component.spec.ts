import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language/language.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('AppComponent', () => {
  let languageServiceMock: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {
    languageServiceMock = jasmine.createSpyObj('LanguageService', ['init']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterOutlet,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call languageService.init() on construction', () => {
    TestBed.createComponent(AppComponent);
    expect(languageServiceMock.init).toHaveBeenCalled();
  });
});
