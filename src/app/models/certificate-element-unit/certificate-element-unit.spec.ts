import { describe, expect, it } from 'vitest';
import { CertificateElementUnit } from './certificate-element-unit';

describe('CertificateElementUnit', () => {
  it('should match the interface structure', () => {
    const unit: CertificateElementUnit = {
      name: 'IT Department',
      acronym: 'IT'
    } satisfies CertificateElementUnit;

    expect(unit.name).toBe('IT Department');
    expect(unit.acronym).toBe('IT');
  });
});
