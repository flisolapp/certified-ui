import {Component, OnInit} from '@angular/core';
import {LanguageService} from '../../services/language/language.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  private darkMode: boolean = false;
  private darkClassName = 'darkMode';
  className = '';
  language: any = null;

  constructor(public languageService: LanguageService) {
  }

  public ngOnInit(): void {
    this.detectAndLoadColorScheme();
    this.language = this.languageService.getSelected();
  }

  public detectAndLoadColorScheme(): void {
    this.darkMode = window.matchMedia('(prefers-color-scheme:dark)').matches;

    const darkModeFromStorage: string | null = localStorage.getItem('flisolapp.DarkMode');
    if (darkModeFromStorage !== null) {
      if (darkModeFromStorage === 'true') {
        this.darkMode = true;
      } else if (darkModeFromStorage === 'false') {
        this.darkMode = false;
      }
    }

    this.applyColorScheme();
  }

  public toggleColorScheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('flisolapp.DarkMode', this.darkMode ? 'true' : 'false');
    this.applyColorScheme();
  }

  private applyColorScheme(): void {
    this.className = this.darkMode ? this.darkClassName : '';

    if (this.darkMode) {
      document.body.classList.add(this.darkClassName);
    } else {
      document.body.classList.remove(this.darkClassName);
    }
  }

  public selectLanguage(item: any): void {
    this.language = item;
    this.languageService.setSelected(item);
  }

}
