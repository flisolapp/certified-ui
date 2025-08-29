import {Injectable} from '@angular/core';
import {CertificateService} from '../certificate/certificate-service';

@Injectable({providedIn: 'root'})
export class DownloadService {

  constructor(private certificateService: CertificateService) {
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject): void => {
      const r = new FileReader();
      r.onerror = (): void => reject(r.error);
      r.onload = (): void => {
        const res: string = String(r.result || '');
        resolve(res.split(',', 2)[1] ?? '');
      };
      r.readAsDataURL(blob);
    });
  }

  public async download(code: string, data: Blob | null = null): Promise<void> {
    const name = `certificate_${code}.png`;
    const blob: Blob = (data instanceof Blob) ? data : await this.certificateService.certificate(code);

    // If running inside Flutter InAppWebView, hand off to native
    if (window.flutter_inappwebview?.callHandler) {
      const base64: string = await this.blobToBase64(blob);
      await window.flutter_inappwebview.callHandler('downloadFile', {
        name,
        mime: blob.type || 'image/png',
        base64
      });
      return;
    }

    // Web fallback: regular browser download
    const url: string = window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);

    try {
      a.click();
    } finally {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

}
