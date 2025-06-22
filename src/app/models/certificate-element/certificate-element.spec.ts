import {CertificateElement} from './certificate-element';
import {CertificateElementUnit} from '../certificate-element-unit/certificate-element-unit';

describe('CertificateElement Interface', () => {
  it('should create a valid CertificateElement object', () => {
    const certificate: CertificateElement = {
      edition: '2025',
      unit: {
        name: 'IT Department',
        acronym: 'IT'
      } as CertificateElementUnit,
      name: 'Francisco Ernesto',
      enjoyedAs: 'Participant',
      code: 'CERT12345',
      download: 'https://example.com/certificates/CERT12345.pdf'
    };

    expect(certificate).toBeTruthy();
    expect(certificate.edition).toBe('2025');
    expect(certificate.download).toContain('.pdf');
  });
});
