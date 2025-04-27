import {Component, OnInit} from '@angular/core';
import {LanguageService} from '../../services/language/language.service';
import {NgOptimizedImage} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  imports: [
    NgOptimizedImage,
    MatIconButton,
    MatTooltip,
    MatIcon,
    TranslatePipe,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent implements OnInit {

  public darkMode: boolean = false;
  public language: any = null;

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
    const darkClassName: string = 'darkMode';

    if (this.darkMode) {
      document.body.classList.add(darkClassName);
    } else {
      document.body.classList.remove(darkClassName);
    }
  }

  public selectLanguage(item: any): void {
    this.language = item;
    this.languageService.setSelected(item);
  }

}
