import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ScrollService} from '../../services/scroll/scroll.service';
import {TranslateService} from '@ngx-translate/core';
import {EventEmitterService} from '../../services/event-emitter/event-emitter.service';
import {HistoryItem} from '../../models/history-item';
import {UuidService} from '../../services/uuid/uuid.service';
import {TermService} from '../../services/term/term.service';

/**
 * SearchComponent - An Angular component for handling search functionality.
 *
 * This component encapsulates the logic and presentation for conducting searches,
 * managing search history, and interacting with various services to achieve its functionality.
 * It implements OnInit and OnDestroy lifecycle hooks for proper initialization and cleanup.
 *
 * Features:
 * - Handles user search input and conducts searches.
 * - Manages and stores search history.
 * - Interacts with `ScrollService`, `TranslateService`, and `EventEmitterService` for various functionalities.
 * - Maintains and manages a list of active subscriptions for event handling and cleanup.
 *
 * Usage:
 * - This component is used wherever search functionality is required in the application.
 * - It should be included in a module with declarations and necessary imports.
 *
 * Component Decorator:
 * - selector: 'app-search' - This is the tag used to embed this component in other Angular templates.
 * - templateUrl: './search.component.html' - The HTML template associated with this component.
 * - styleUrl: './search.component.scss' - The styles specifically for this component.
 *
 * Lifecycle:
 * - ngOnInit: Sets initial state, subscribes to route parameters, loads search history, and subscribes to events.
 * - ngOnDestroy: Cleans up subscriptions to avoid memory leaks.
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {

  term: string | undefined | null = '';
  searching: boolean = false;
  showHistory: boolean = true;
  history: HistoryItem[] = [];

  private subscriptions: any[] = [];

  /**
   * Constructor for the component.
   *
   * Initializes a new instance of the component with necessary dependency injections.
   *
   * @param route An `ActivatedRoute` object that contains information about the route associated with the component.
   *    This includes parameters, and the route's URL path, which can be used for routing logic in the component.
   * @param router A `Router` object that is used for navigating between routes or getting information about current route.
   *    It allows for programmatically initiating navigation and manipulating navigation history.
   * @param translate A `TranslateService` object for handling internationalization and localization.
   *    This service allows for translating text in the component based on the selected language or locale.
   *
   * Notes:
   * - The `route` and `router` are marked as private, meaning they are intended to be used only within this class.
   * - `translate` is marked as public, making it accessible to both the class and its templates, useful for dynamic translations.
   * - This constructor doesn't contain any custom initialization logic. Its primary purpose is to inject dependencies
   *   needed by the component. Actual initialization is often performed in Angular lifecycle hooks like `ngOnInit`.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService
  ) {
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties.
   *
   * This method is an Angular lifecycle hook that gets invoked when the component is initialized.
   * It performs several key tasks:
   * 1. Scrolls to the top of the page using `ScrollService.toTop()`.
   * 2. Subscribes to route parameter changes to update the `term` property and sets `searching` to true.
   * 3. Loads the search history by calling `this.loadHistory()`.
   * 4. Sets focus on the term input field by calling `this.setFocusOnTermInputField()`.
   * 5. Subscribes to various events using `EventEmitterService` and updates the component's state accordingly.
   *    - Updates `searching` based on 'searching' events.
   *    - Sets `searching` to false and hides history on 'search-items-not-found' events.
   *    - Resets `term` and `searching`, and shows history on 'search-clear' events.
   *
   * Notes:
   * - The method is public as it is an Angular lifecycle hook.
   * - It's essential in Angular applications to manage subscriptions to avoid memory leaks. Hence,
   *   subscriptions are stored in `this.subscriptions` for later cleanup.
   * - This method sets up the initial state of the component and prepares it for user interaction.
   * - It does not return any value.
   */
  public ngOnInit(): void {
    ScrollService.toTop();

    this.route.paramMap.subscribe((paramMap: ParamMap): void => {
      this.term = paramMap.get('term');

      if (this.term !== null) //
        this.searching = true;
    });

    this.loadHistory();
    this.setFocusOnTermInputField();

    this.subscriptions.push(EventEmitterService.get('searching').subscribe((searching: boolean): void => {
      this.searching = searching;
    }));
    this.subscriptions.push(EventEmitterService.get('search-items-not-found').subscribe((): void => {
      this.searching = false;
      this.showHistory = false;
      this.setFocusOnTermInputField();
    }));
    this.subscriptions.push(EventEmitterService.get('search-clear').subscribe((): void => {
      this.term = null;
      this.searching = false;
      this.showHistory = true;
      this.setFocusOnTermInputField();
    }));
  }

  /**
   * Lifecycle hook that is called when a directive, pipe, or service is destroyed.
   *
   * This method is an Angular lifecycle hook that gets invoked when the instance of the
   * component or directive is about to be destroyed. It serves the following purpose:
   * 1. Calls `this.disposeSubscriptions()` to clean up and unsubscribe from any active
   *    subscriptions that the component may have created during its lifecycle.
   *
   * Notes:
   * - The method is public as it overrides a lifecycle hook defined in Angular's core.
   * - It's a good practice to implement the `ngOnDestroy` method to release resources,
   *   unsubscribe from observables, and perform other cleanup to avoid memory leaks.
   * - In this particular implementation, the primary task is to dispose of subscriptions,
   *   ensuring that any event listeners or asynchronous tasks initiated by the component
   *   are properly terminated when the component is destroyed.
   * - This method does not return any value.
   */
  public ngOnDestroy(): void {
    this.disposeSubscriptions();
  }

  /**
   * Disposes of all active subscriptions.
   *
   * This method is responsible for cleaning up and unsubscribing from all active
   * subscriptions held in the `subscriptions` array. It performs the following actions:
   * 1. Iterates over each item in the `subscriptions` array.
   * 2. For each subscription, it removes the first item from the array using `array.shift()`
   *    and then calls `unsubscribe()` on it.
   *
   * Notes:
   * - The method is private, meaning it's intended to be used internally within the class.
   * - This method is implemented as an arrow function, ensuring that the value of `this`
   *   remains consistent and refers to the class instance when the method is called.
   * - The use of `array.shift()` inside the loop is a bit unconventional. It alters the array
   *   during iteration, which typically is not recommended. However, in this case, it ensures that
   *   each subscription is only unsubscribed once and that the `subscriptions` array is cleared.
   * - The method assumes that all items in `subscriptions` are objects with an `unsubscribe` method,
   *   which is typical for RxJS subscriptions.
   * - This method does not return any value.
   */
  private disposeSubscriptions(): void {
    this.subscriptions.forEach((item: number, index: number, array: any[]) => //
      array.shift().unsubscribe());
  }

  /**
   * Sets the focus on the term input field after a brief delay.
   *
   * This method is used to programmatically set the focus on a specific input field,
   * identified by the ID 'term', on the webpage. It performs the following actions:
   * 1. Delays the execution of the focus command by 200 milliseconds using `setTimeout`.
   * 2. Once the delay is over, it attempts to find the DOM element with the ID 'term'.
   * 3. If the element is found, it sets the focus to this input field.
   *
   * Notes:
   * - The method is private, indicating that it is intended to be used only within this class.
   * - The delay of 200 milliseconds is used to ensure that the focus is set after any ongoing
   *   UI updates or navigations that might interfere with the focusing action.
   * - The use of the optional chaining operator (?.) in `document.getElementById('term')?.focus()`
   *   ensures that the method does not throw an error if the element with the ID 'term' does not exist.
   * - This method does not return any value.
   */
  private setFocusOnTermInputField(): void {
    setTimeout(() => document.getElementById('term')?.focus(), 200);
  }

  /**
   * Performs a search operation with the given term.
   *
   * @param term The search term to be used, which can be a string or null.
   *
   * This method initiates a search operation based on the provided term. It performs several actions:
   * 1. Scrolls to the top of the page using `ScrollService.toTop()`.
   * 2. Sets the `searching` state to `true`, indicating that a search is in progress.
   * 3. Checks if the term is not null and not an empty string, and if so, updates the `term` property.
   * 4. Navigates to a route based on the search term using `this.router.navigate()`.
   *    - The navigation result is not used (indicated by 'Do nothing.' in the thenable).
   * 5. Emits the search term through the `EventEmitterService` to notify other components.
   * 6. Sets `showHistory` to `true` to display the search history.
   * 7. Calls `saveHistory` to add the current term to the search history.
   *
   * Notes:
   * - The method is public and can be called from outside the class.
   * - It does not return any value.
   * - The search term is required for navigation but can be null or empty, which might result in different UI behaviors.
   */
  public doSearch(term: string | undefined | null): void {
    ScrollService.toTop();
    this.searching = true;

    if (term !== null || term !== '') //
      this.term = term;

    this.term = TermService.prepare(this.term);

    this.router.navigate(['/', this.term]).then((result: boolean): void => {
      // Do nothing.
    });
    EventEmitterService.get('search-result-do-search').emit(this.term);

    this.showHistory = true;
    this.saveHistory();
  }

  /**
   * Loads the search history from local storage.
   *
   * This method is tasked with retrieving the search history stored in the local storage
   * and updating the history state of the application. The steps involved are:
   * 1. Retrieves the history data from local storage under the key 'flisolapp.History'.
   * 2. Checks if the retrieved data is not null.
   * 3. Attempts to parse the JSON string from local storage to an array of `HistoryItem` objects.
   * 4. If parsing is successful, updates the history state with the parsed data.
   * 5. If parsing fails (e.g., due to invalid JSON format), it catches the error and does nothing.
   *
   * Assumptions:
   * - The method is private and hence, can only be called within the class.
   * - The history data is expected to be stored as a JSON string in the local storage.
   * - The history is an array of `HistoryItem` objects.
   * - Each `HistoryItem` contains at least two properties: `term` (string) and `searched` (Date).
   *
   * Notes:
   * - The method does not return any value.
   * - In case of an error during JSON parsing, the method silently ignores the error (i.e., does not throw).
   * - If no history data is found in local storage, the method leaves the history state unchanged.
   */
  private loadHistory(): void {
    const historyFromStorage: string | null = localStorage.getItem('flisolapp.History');
    if (historyFromStorage !== null) {
      try {
        this.history = JSON.parse(historyFromStorage);
      } catch (e) {
        // Do nothing.
      }
    }
  }

  /**
   * Saves the search term to the history.
   *
   * This method is responsible for managing the search history of the application.
   * It performs several functions:
   * 1. Checks if the current term is non-null and non-empty.
   * 2. If the term already exists in the history, it removes the existing entry.
   * 3. Adds the new term along with the current date and time to the history.
   * 4. Sorts the history entries in descending order based on the search date.
   * 5. Truncates the history to the most recent 5 entries.
   * 6. Saves the updated history to the local storage.
   *
   * Assumptions:
   * - The method is private and hence, can only be called within the class.
   * - The history is stored in an array of `HistoryItem` objects.
   * - Each `HistoryItem` contains at least two properties: `term` (string) and `searched` (Date).
   * - The history is stored in the local storage under the key 'flisolapp.History'.
   *
   * Notes:
   * - The method does not return any value.
   * - If the term is null or empty, the method does not perform any operation.
   */
  private saveHistory(): void {
    const termPrepared: string | undefined = TermService.prepare(this.term);

    // If term could be searched
    if (termPrepared && termPrepared.length > 0) {
      // Insert a new item at the start of the history
      const historyItem: HistoryItem = {
        id: UuidService.generateUUID(),
        term: termPrepared,
        searched: new Date()
      };
      this.history.unshift(historyItem);

      // Remove older duplicates of the same term
      this.history = this.history.filter((item: HistoryItem, index: number, self: HistoryItem[]): boolean => //
        index === self.findIndex((t: HistoryItem): boolean => t.term.toLowerCase() === item.term.toLowerCase()));

      // Limit the history to 5 elements
      if (this.history.length > 5) //
        this.history.length = 5;

      localStorage.setItem('flisolapp.History', JSON.stringify(this.history));
    }
  }

}
