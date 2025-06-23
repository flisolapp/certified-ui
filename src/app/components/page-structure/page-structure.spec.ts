import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PageStructure} from './page-structure';
import {Component, provideZonelessChangeDetection} from '@angular/core';
import packageInfo from '../../../../package.json';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';

// Mock ToolbarComponent as Standalone
@Component({
  selector: 'app-toolbar',
  template: ''
})
class MockToolbarComponent {
}

describe('PageStructure', (): void => {
  let component: PageStructure;
  let fixture: ComponentFixture<PageStructure>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      imports: [
        PageStructure,
        MockToolbarComponent,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: TranslateFakeLoader}
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageStructure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', (): void => {
    expect(component).toBeTruthy();
  });

  it('should have version set from package.json', (): void => {
    // Should be "2.5.0"
    expect(component.version()).toBe(packageInfo.version);
  });
});
