import {Injectable} from '@angular/core';

/**
 * A service for handling and processing search terms.
 *
 * This service provides functionalities related to the manipulation and standardization
 * of search terms used throughout the application. It is designed to be injected at the root level,
 * ensuring its availability across the application.
 *
 * Methods:
 * - `prepare`: Processes a given search term by trimming whitespace, converting it to lowercase
 *    if the term is an email, and removing all characters except numbers and unaccented letters if not.
 *    This approach standardizes the search terms, which is especially useful for case-insensitive
 *    items like email addresses and ensures clean, alphanumeric input for other types of search terms.
 *
 * Usage:
 * - `TermService` is meant to be used wherever there is a need to standardize search terms
 *    before using them in search operations or storing them. This can include search bars,
 *    form inputs, or any other place where user input is taken for searching purposes.
 *
 * Example:
 * - Inject `TermService` in a component or another service and use `TermService.prepare(term)`
 *    to process the term before using it. This method ensures that emails are handled in a case-insensitive
 *    manner and other search terms are cleaned from any non-alphanumeric characters.
 */
@Injectable({
  providedIn: 'root'
})
export class TermService {

  /**
   * Constructor for the TermService.
   *
   * As an Angular service, TermService is designed to be a singleton that is injected
   * and shared across components and other services in the application. This constructor
   * is responsible for any initial setup the service requires when it is instantiated by
   * the Angular Dependency Injection system. Currently, the constructor has no specific
   * implementation, indicating that the service does not require any special initialization
   * logic at the time of its creation.
   *
   * Usage:
   * - The constructor is automatically called by Angular's Dependency Injection system when
   *   the service is first required. There is generally no need to call it manually.
   * - The service is provided at the root level (`providedIn: 'root'`), ensuring a single
   *   instance throughout the application.
   */
  constructor() {
  }

  /**
   * Prepares a given search term by trimming it, converting it to lowercase if it's an email,
   * and removing non-alphanumeric characters if it's not an email.
   *
   * This static method processes a search term in the following way:
   * 1. Trims any leading and trailing whitespace from the term.
   * 2. Checks if the term is in a valid email format.
   * 3. If the term is an email, it converts the term to lowercase for consistency.
   * 4. If the term is not an email, it removes all characters except numbers and unaccented letters.
   * 5. If the term is undefined or null, it returns undefined.
   *
   * @param term The search term to be prepared. Can be a string, undefined, or null.
   * @returns The processed term: if it's an email, it's trimmed and converted to lowercase;
   *          if it's not an email, it's trimmed and cleansed of non-alphanumeric characters;
   *          returns undefined if the input term is undefined or null.
   *
   * Usage:
   * - This method is useful for search functionalities where the input needs to be standardized.
   *   It ensures consistency for email addresses and cleanses other types of search terms
   *   by removing non-essential characters.
   */
  public static prepare(term: string | undefined | null): string | undefined {
    if (term === undefined || term === null) //
      return undefined;

    const isEmail = (term: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(term);

    // Trim the term and process it for a URL-like format if needed
    let processedTerm = term.substring(term.lastIndexOf('/') + 1).trim();

    if (isEmail(processedTerm)) {
      // If the term is an email, convert it to lowercase
      processedTerm = processedTerm.toLowerCase();
    } else {
      // If not an email, remove all characters except numbers and unaccented letters
      processedTerm = processedTerm.replace(/[^a-zA-Z0-9]/g, '');
    }

    return processedTerm;
  }

}
