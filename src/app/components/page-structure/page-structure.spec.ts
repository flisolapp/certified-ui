import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PageStructure} from './page-structure';
import {Component, provideZonelessChangeDetection} from '@angular/core';
import packageInfo from '../../../../package.json';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';


// Mock ToolbarComponent as Standalone
@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: ''
})
class MockToolbarComponent {
}

describe('PageStructure', () => {
  let component: PageStructure;
  let fixture: ComponentFixture<PageStructure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      imports: [
        PageStructure,   // Import your standalone component
        MockToolbarComponent,     // Mocked toolbar to avoid real dependencies
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageStructure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have version set from package.json', () => {
    expect(component.version()).toBe(packageInfo.version);  // Should be "2.5.0"
  });
});
