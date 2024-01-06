import {Component} from '@angular/core';

// FIX: Error: Should not import the named export 'version' (imported as 'packageInfo') from default-exporting module (only default export is available soon)
import {default as packageInfo} from '../../../../package.json';

@Component({
  selector: 'app-page-structure',
  templateUrl: './page-structure.component.html',
  styleUrls: ['./page-structure.component.scss']
})
export class PageStructureComponent {

  version: string = packageInfo.version;

}
