import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ToolbarComponent} from './toolbar.component';
import {LanguageService} from '../../services/language/language.service';

describe('ToolbarComponent', (): void => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;

  beforeEach(async (): Promise<void> => {
    // Create a spy object with 'getSelected' and 'setSelected' methods
    languageServiceSpy = jasmine.createSpyObj('LanguageService', ['getSelected', 'setSelected']);

    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      providers: [
        {provide: LanguageService, useValue: languageServiceSpy}
      ]
    })
      .compileComponents();
  });

  beforeEach((): void => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should set language on init', (): void => {
    const mockLanguage = {name: 'English (USA)', code: 'en', flag: 'US'};
    languageServiceSpy.getSelected.and.returnValue(mockLanguage);

    component.ngOnInit();

    expect(component.language).toEqual(mockLanguage);
    expect(languageServiceSpy.getSelected).toHaveBeenCalled();
  });

  it('should select a language', (): void => {
    const newLanguage = {name: 'Español (España)', code: 'es', flag: 'ES'};

    component.selectLanguage(newLanguage);

    expect(component.language).toEqual(newLanguage);
    expect(languageServiceSpy.setSelected).toHaveBeenCalledWith(newLanguage);
  });
});
