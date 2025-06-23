import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UuidService {

  /**
   * Generates a version 4 UUID (Universally Unique Identifier).
   *
   * This method creates a random UUID conforming to the version 4 UUID standard, which is
   * randomly generated. The UUID is a 36-character string, including hyphens, in the form:
   * 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', where each 'x' is replaced with a random
   * hexadecimal digit from 0 to f, and 'y' is replaced with a random hexadecimal digit from 8 to b.
   *
   * How it works:
   * - The UUID string format is defined with 'x' and 'y' placeholders.
   * - The `replace` function iterates over each placeholder character in the string.
   * - For each character, a random number (r) between 0 and 15 (inclusive) is generated.
   * - If the character is 'x', it's directly replaced with the hexadecimal representation of r.
   * - If the character is 'y', the bitwise operations ensure that the first bit is set to '1'
   *   (resulting in a number between 8 and 11 in hexadecimal) to conform with the UUID v4 specification.
   * - The resulting string is a valid UUID v4.
   *
   * Returns:
   * - A string representing a randomly generated UUID.
   */
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r: number = Math.random() * 16 | 0;
      const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

      return v.toString(16);
    });
  }

}
