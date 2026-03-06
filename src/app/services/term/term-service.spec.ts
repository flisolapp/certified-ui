import { describe, expect, it } from 'vitest';
import { TermService } from './term-service';

describe('TermService', () => {
  describe('prepare', () => {
    it('should process and return a valid email in lowercase', () => {
      const term = '  Test@Example.COM  ';
      const result = TermService.prepare(term);
      expect(result).toBe('test@example.com');
    });

    it('should process and return a valid code (alphanumeric 15-18 chars)', () => {
      const term = ' ABC123def456GHI ';
      const result = TermService.prepare(term);
      expect(result).toBe('ABC123def456GHI');
    });

    it('should clean non-alphanumeric characters and return valid code', () => {
      const term = '##ABC123_def456_GHI789!!';
      const result = TermService.prepare(term);
      expect(result).toBe('ABC123def456GHI789');
    });

    it('should extract term after last slash and process it', () => {
      const term = '/path/to/Test@Example.COM';
      const result = TermService.prepare(term);
      expect(result).toBe('test@example.com');
    });

    it('should throw error with cause -1 for undefined term', () => {
      try {
        TermService.prepare(undefined);
        throw new Error('Expected TermService.prepare to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(EvalError);
        expect(String(e.message)).toMatch(/required/i);
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -1 for null term', () => {
      try {
        TermService.prepare(null);
        throw new Error('Expected TermService.prepare to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(EvalError);
        expect(String(e.message)).toMatch(/required/i);
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -1 for empty string', () => {
      try {
        TermService.prepare('   ');
        throw new Error('Expected TermService.prepare to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(EvalError);
        expect(String(e.message)).toMatch(/required/i);
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -2 if extracted term is empty', () => {
      try {
        TermService.prepare('/////');
        throw new Error('Expected TermService.prepare to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(EvalError);
        expect(String(e.message)).toMatch(/invalid to search/i);
        expect(e.cause).toBe(-2);
      }
    });

    it('should throw error with cause -3 for invalid term format', () => {
      const invalidTerm = 'invalid_term@';

      try {
        TermService.prepare(invalidTerm);
        throw new Error('Expected TermService.prepare to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(EvalError);
        expect(String(e.message)).toMatch(/must be an e-mail or certificate/i);
        expect(e.cause).toBe(-3);
      }
    });
  });
});
