import {Component, OnInit} from '@angular/core';
import {LanguageService} from '../../services/language/language.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  language: any = null;

  constructor(public languageService: LanguageService) {
  }

  public ngOnInit(): void {
    this.language = this.languageService.getSelected();
  }

  public selectLanguage(item: any): void {
    this.language = item;
    this.languageService.setSelected(item);
  }

}
