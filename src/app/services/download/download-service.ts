import { Injectable } from '@angular/core';
import { CertificateService } from '../certificate/certificate-service';
import { DeviceService } from '../device/device-service';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  constructor(private certificateService: CertificateService) {}

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
    const blob: Blob =
      data instanceof Blob ? data : await this.certificateService.certificate(code);

    // If running inside Flutter InAppWebView, hand off to native
    if (window.flutter_inappwebview?.callHandler) {
      const base64: string = await this.blobToBase64(blob);
      await window.flutter_inappwebview.callHandler('downloadFile', {
        name,
        mime: blob.type || 'image/png',
        base64,
      });
      return;
    }

    // Web fallback.
    // iOS browsers run on WebKit and can recurse when a programmatic <a>.click()
    // happens on pages modified by browser translation tools (for example,
    // html.translated-ltr). Opening the Blob URL avoids the stack overflow seen
    // in Sentry while still allowing the user to save/share the certificate.
    const url: string = window.URL.createObjectURL(blob);

    if (DeviceService.isIos()) {
      window.open(url, '_blank', 'noopener,noreferrer');

      setTimeout((): void => {
        window.URL.revokeObjectURL(url);
      }, 30000);

      return;
    }

    const a: HTMLAnchorElement = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);

    try {
      a.click();
    } finally {
      setTimeout((): void => {
        if (a.isConnected) {
          document.body.removeChild(a);
        }

        window.URL.revokeObjectURL(url);
      }, 1000);
    }
  }
}
