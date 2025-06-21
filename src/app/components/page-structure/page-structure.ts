import {Component, signal} from '@angular/core';

// FIX: Avoid named import for soon-to-be ESM-only default exports
import packageInfo from '../../../../package.json';
import {Toolbar} from '../toolbar/toolbar';

@Component({
  selector: 'app-page-structure',
  standalone: true,
  imports: [
    Toolbar
  ],
  templateUrl: './page-structure.html',
  styleUrl: './page-structure.scss'
})
export class PageStructure {

  public version = signal<string>(packageInfo.version);

}
