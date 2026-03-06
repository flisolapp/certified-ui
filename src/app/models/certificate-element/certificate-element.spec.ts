import { describe, expect, it } from 'vitest';
import { CertificateElement } from './certificate-element';

describe('CertificateElement', () => {
  it('should match the interface structure', () => {
    const certificate: CertificateElement = {
      edition: '2025',
      unit: {
        name: 'IT Department',
        acronym: 'IT'
      },
      name: 'Francisco Ernesto',
      enjoyedAs: 'Participant',
      code: 'CERT12345',
      download: 'https://example.com/certificates/CERT12345.pdf'
    } satisfies CertificateElement;

    expect(certificate.edition).toBe('2025');
    expect(certificate.unit.acronym).toBe('IT');
    expect(certificate.code).toBe('CERT12345');
    expect(certificate.download).toMatch(/\.pdf$/);
  });
});
