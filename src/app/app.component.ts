import {Component} from '@angular/core';
import {BrowserDetectorService} from './services/browser-detector/browser-detector.service';
import {LanguageService} from './services/language/language.service';
import {PrimeNGConfig} from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title: string = 'certified-ui';

  constructor(
    public browserDetectorService: BrowserDetectorService,
    private languageService: LanguageService,
    private primengConfig: PrimeNGConfig
  ) {
    browserDetectorService.init();
    languageService.init();
    primengConfig.ripple = true;
  }

}
