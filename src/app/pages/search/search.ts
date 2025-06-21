import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {PageStructure} from '../../components/page-structure/page-structure';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatList, MatListItem} from '@angular/material/list';
import {MatRipple} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {CustomValidators} from '../../forms/custom-validators/custom-validators';
import {CustomErrorStateMatcher} from '../../forms/custom-error-state-matcher/custom-error-state-matcher';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';
import {HistoryItem} from '../../models/history-item/history-item';
import {ScrollService} from '../../services/scroll/scroll-service';
import {EventEmitterService} from '../../services/event-emitter/event-emitter-service';
import {TermService} from '../../services/term/term-service';
import {UuidService} from '../../services/uuid/uuid-service';
import {first, firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    PageStructure,
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    ReactiveFormsModule,
    MatIconButton,
    MatList,
    MatListItem,
    MatRipple,
    MatIcon,
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit, OnDestroy {

  public termFormControl = new FormControl<string | null>('', [
    Validators.required,
    CustomValidators.term,
  ]);
  public matcher = new CustomErrorStateMatcher();

  private snackBarRef: MatSnackBarRef<TextOnlySnackBar> | null = null;
  public searching = signal<boolean>(false);
  public showHistory = signal<boolean>(true);
  public history = signal<HistoryItem[]>([]);

  private subscriptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private snackBar: MatSnackBar
  ) {
  }

  public async ngOnInit(): Promise<void> {
    ScrollService.toTop();

    try {
      const paramMap = await firstValueFrom(this.route.paramMap.pipe(first()));
      const term = paramMap.get('term');
      this.termFormControl.setValue(term);

      if (this.termFormControl.valid) {
        this.searching.set(true);
      }
    } catch {
    }

    this.loadHistory();
    this.setFocusOnTermInputField();

    this.subscriptions.push(EventEmitterService.get('searching').subscribe((searching: boolean) => {
      this.searching.set(searching);
    }));

    this.subscriptions.push(EventEmitterService.get('search-items-not-found').subscribe(() => {
      this.searching.set(false);
      this.showHistory.set(false);
      this.setFocusOnTermInputField();
    }));

    this.subscriptions.push(EventEmitterService.get('search-clear').subscribe(() => {
      this.termFormControl.setValue(null);
      this.searching.set(false);
      this.showHistory.set(true);
      this.setFocusOnTermInputField();
    }));
  }

  public ngOnDestroy(): void {
    this.disposeSubscriptions();
  }

  private disposeSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private setFocusOnTermInputField(): void {
    requestAnimationFrame(() => document.getElementById('term')?.focus());
  }

  public doSearch(term: string | undefined | null): void {
    ScrollService.toTop();

    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    if (term) {
      this.termFormControl.setValue(term);
    }

    try {
      this.termFormControl.setValue(TermService.prepare(this.termFormControl.value));

      this.searching.set(true);
      this.router.navigate(['/', this.termFormControl.value]).then(() => {
      });
      EventEmitterService.get('search-result-do-search').emit(this.termFormControl.value);

      this.showHistory.set(true);
      this.saveHistory(this.termFormControl.value!);
    } catch (e: any) {
      console.error(e?.message, e?.cause);

      this.translate.get(['search.error.' + e?.cause, 'common.ok']).subscribe(values => {
        this.snackBarRef = this.snackBar.open(values['search.error.' + e?.cause], values['common.ok'], {
          duration: 3000,
        });
        this.setFocusOnTermInputField();
      });
    }
  }

  private loadHistory(): void {
    const historyFromStorage = localStorage.getItem('flisolapp.History');

    if (historyFromStorage) {
      try {
        this.history.set(JSON.parse(historyFromStorage));
      } catch {
        // Do nothing
      }
    }
  }

  private saveHistory(term: string): void {
    if (term && term.length > 0) {
      const updatedHistory = [
        {
          id: UuidService.generateUUID(),
          term,
          searched: new Date()
        },
        ...this.history().filter(item => item.term.toLowerCase() !== term.toLowerCase())
      ].slice(0, 5);

      this.history.set(updatedHistory);
      localStorage.setItem('flisolapp.History', JSON.stringify(updatedHistory));
    }
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    if (this.termFormControl.valid) {
      this.doSearch(this.termFormControl.value);
    }
  }
}
