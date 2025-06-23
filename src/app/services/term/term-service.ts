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
   * Prepares a given search term by trimming it, converting it to lowercase if it's an email,
   * and removing non-alphanumeric characters if it's not an email.
   *
   * The method processes a search term as follows:
   * 1. Trims any leading and trailing whitespace from the term.
   * 2. Checks if the term is in a valid email format.
   * 3. If the term is an email, it converts the term to lowercase for consistency.
   * 4. If the term is not an email, it removes all characters except numbers and unaccented letters.
   * 5. Throws an error if the term is null, an empty string after trimming, or doesn't match the expected patterns.
   *
   * @param term The search term to be prepared. Can be a string, null, or undefined.
   * @returns The processed term: if it's an email, it's trimmed and converted to lowercase;
   *          if it's not an email, it's trimmed and cleansed of non-alphanumeric characters;
   *          throws an error if the term is null, undefined, or doesn't match the expected formats.
   *
   * Usage:
   * - This method is useful for search functionalities where the input needs to be standardized.
   *   It ensures consistency for email addresses and cleanses other types of search terms
   *   by removing non-essential characters.
   */
  public static prepare(term: string | undefined | null): string {
    // Check if the term is null, undefined, or an empty string and throw an error if any.
    // This ensures that we have a valid, non-empty string to process.
    if (term === undefined || term === null || term.trim() === '') {
      throw new EvalError('The term is invalid to search. It is required.', {cause: -1});
    }

    // Define a function to check if a string is a valid email.
    // This uses a regular expression to match the general format of email addresses.
    const isEmail = (term: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(term);

    // Define a function to check if a string is a valid code.
    // This uses a regular expression to match a string of 15 to 18 alphanumeric characters.
    const isCode = (term: string): boolean => /^[A-Za-z0-9]{15,18}$/.test(term);

    // Process the term to extract the last segment after the last '/' character.
    // This is useful for cases where the term might be part of a URL or path-like string.
    let processedTerm: string = term.substring(term.lastIndexOf('/') + 1).trim();

    // Further validate the processed term to ensure it's not an empty string.
    // Throw an error if the processed term is empty after trimming.
    if (processedTerm === undefined || processedTerm === null || processedTerm === '') {
      throw new EvalError('The term is invalid to search.', {cause: -2});
    }

    // Convert the term to lowercase if it's an email to ensure consistency.
    // If it's not an email, remove all non-alphanumeric characters to sanitize the term.
    if (isEmail(processedTerm)) {
      processedTerm = processedTerm.toLowerCase();
    } else {
      processedTerm = processedTerm.replace(/[^a-zA-Z0-9]/g, '');
    }

    // Ensure the term is either a valid email or code.
    // If it doesn't fit either pattern, throw an error indicating the term is invalid.
    if (!isEmail(processedTerm) && !isCode(processedTerm)) {
      throw new EvalError('The term is invalid to search. Must be an e-mail or certificate\'s code.', //
        {cause: -3});
    }

    // Return the processed term if it's valid.
    return processedTerm;
  }

}
