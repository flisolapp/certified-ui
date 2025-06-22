import {CertificateElementUnit} from './certificate-element-unit';

describe('CertificateElement Interface', () => {
  it('should create a valid CertificateElement object', () => {
    const unit: CertificateElementUnit = {
      name: 'IT Department',
      acronym: 'IT'
    };

    expect(unit).toBeTruthy();
    expect(unit.name).toBe('IT Department');
    expect(unit.acronym).toContain('IT');
  });
});
