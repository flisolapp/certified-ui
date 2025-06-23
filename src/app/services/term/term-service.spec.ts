import {TermService} from './term-service';

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

    it('should extract term after last slash and process it', () => {
      const term = '/path/to/Test@Example.COM';
      const result = TermService.prepare(term);
      expect(result).toBe('test@example.com');
    });

    it('should throw error with cause -1 for undefined term', () => {
      expect(() => TermService.prepare(undefined)).toThrowError(EvalError, /required/);
      try {
        TermService.prepare(undefined);
      } catch (e: any) {
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -1 for null term', () => {
      expect(() => TermService.prepare(null)).toThrowError(EvalError, /required/);
      try {
        TermService.prepare(null);
      } catch (e: any) {
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -1 for empty string', () => {
      expect(() => TermService.prepare('   ')).toThrowError(EvalError, /required/);
      try {
        TermService.prepare('   ');
      } catch (e: any) {
        expect(e.cause).toBe(-1);
      }
    });

    it('should throw error with cause -2 if extracted term is empty', () => {
      expect(() => TermService.prepare('/////')).toThrowError(EvalError, /invalid to search/);
      try {
        TermService.prepare('/////');
      } catch (e: any) {
        expect(e.cause).toBe(-2);
      }
    });

    it('should throw error with cause -3 for invalid term format', () => {
      const invalidTerm = 'invalid_term@';
      expect(() => TermService.prepare(invalidTerm)).toThrowError(EvalError, /Must be an e-mail or certificate/);
      try {
        TermService.prepare(invalidTerm);
      } catch (e: any) {
        expect(e.cause).toBe(-3);
      }
    });

  });
});
