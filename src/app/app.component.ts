import {Component} from '@angular/core';
import {LanguageService} from './services/language/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title: string = 'certified-ui';

  constructor(private languageService: LanguageService) {
    languageService.init();
  }

}
