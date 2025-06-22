import {CertificateElementUnit} from '../certificate-element-unit/certificate-element-unit';

export interface CertificateElement {
  edition: string;
  unit: CertificateElementUnit;
  name: string;
  enjoyedAs: string;
  code: string;
  download: string;
}
