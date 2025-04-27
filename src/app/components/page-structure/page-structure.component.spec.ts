import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PageStructureComponent} from './page-structure.component';
import {Component} from '@angular/core';
import packageInfo from '../../../../package.json';
import {TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';


// Mock ToolbarComponent as Standalone
@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: ''
})
class MockToolbarComponent {
}

describe('PageStructureComponent', () => {
  let component: PageStructureComponent;
  let fixture: ComponentFixture<PageStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PageStructureComponent,   // Import your standalone component
        MockToolbarComponent,     // Mocked toolbar to avoid real dependencies
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have version set from package.json', () => {
    expect(component.version).toBe(packageInfo.version);  // Should be "2.5.0"
  });
});
