import {Component} from '@angular/core';

// FIX: Error: Should not import the named export 'version' (imported as 'packageInfo') from default-exporting module (only default export is available soon)
import {default as packageInfo} from '../../../../package.json';
import {ToolbarComponent} from '../toolbar/toolbar.component';

@Component({
  selector: 'app-page-structure',
  imports: [
    ToolbarComponent
  ],
  templateUrl: './page-structure.component.html',
  styleUrl: './page-structure.component.scss'
})
export class PageStructureComponent {

  public version: string = packageInfo.version;

}
