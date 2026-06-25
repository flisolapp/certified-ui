import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DownloadService } from './download-service';
import { CertificateService } from '../certificate/certificate-service';

class CertificateServiceMock {
  certificate = vi.fn();
}

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler(name: string, ...args: any): Promise<any>;
    };
  }
}

describe('DownloadService', () => {
  let service: DownloadService;
  let certSvc: CertificateServiceMock;

  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;

  // IMPORTANT: bind() to preserve correct `this` and avoid overload typing issues
  const originalCreateElement = document.createElement.bind(document);

  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;
  const OriginalFileReader = (window as any).FileReader;

  class FakeFileReader {
    public result: unknown = null;
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(blob: Blob): void {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,QUJD`;
      this.onload?.call(this as any, {} as any);
    }
  }

  class FileReaderNullResult {
    public result: unknown = null;
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(_blob: Blob): void {
      this.onload?.call(this as any, {} as any);
    }
  }

  class FileReaderError {
    public result: unknown = null;
    public error: any = new Error('reader failed');
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(_blob: Blob): void {
      this.onerror?.call(this as any, {} as any);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        DownloadService,
        { provide: CertificateService, useClass: CertificateServiceMock },
      ],
    });

    service = TestBed.inject(DownloadService);
    certSvc = TestBed.inject(CertificateService) as unknown as CertificateServiceMock;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;

    // restore DOM APIs
    (document as any).createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;

    (window as any).FileReader = OriginalFileReader;
    delete window.flutter_inappwebview;

    vi.restoreAllMocks();
  });

  it('hands off to Flutter InAppWebView...', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = vi.fn().mockResolvedValue(undefined);
    window.flutter_inappwebview = { callHandler: callHandlerSpy };

    const blob = new Blob(['abc'], { type: 'image/png' });
    await service.download('X123', blob);

    expect(certSvc.certificate).not.toHaveBeenCalled();

    expect(callHandlerSpy).toHaveBeenCalledTimes(1);
    const [handlerName, payload] = callHandlerSpy.mock.calls[0] as any[];

    expect(handlerName).toBe('downloadFile');
    expect(payload.name).toBe('certificate_X123.png');
    expect(payload.mime).toBe('image/png');
    expect(payload.base64).toBe('QUJD');
  });

  it('fetches the Blob when data is null, then hands off to Flutter', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = vi.fn().mockResolvedValue(undefined);
    window.flutter_inappwebview = { callHandler: callHandlerSpy };

    const fetched = new Blob(['xyz'], { type: 'image/png' });
    certSvc.certificate.mockResolvedValue(fetched);

    await service.download('ABC', null);

    expect(certSvc.certificate).toHaveBeenCalledTimes(1);
    expect(certSvc.certificate).toHaveBeenCalledWith('ABC');
    expect(callHandlerSpy).toHaveBeenCalled();
  });

  it('performs a regular browser download when Flutter bridge is absent', async () => {
    vi.useFakeTimers();

    const urlStub = 'blob://test-object-url';

    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(urlStub);
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    // Use a REAL anchor element
    const realAnchor = originalCreateElement('a') as HTMLAnchorElement;
    const clickSpy = vi.spyOn(realAnchor, 'click').mockImplementation(() => {});

    // Fix overload typing: accept any args
    vi.spyOn(document, 'createElement').mockImplementation(((...args: any[]) => {
      const [tag] = args;
      if (tag === 'a') return realAnchor;
      return originalCreateElement(...(args as [any]));
    }) as any);

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const blob = new Blob(['payload'], { type: 'image/png' });
    await service.download('DLD', blob);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(appendSpy).toHaveBeenCalledWith(realAnchor);

    expect(realAnchor.href).toBe(urlStub);
    expect(realAnchor.download).toBe('certificate_DLD.png');

    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(removeSpy).toHaveBeenCalledWith(realAnchor);
    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });

  it('revokes object URL even if anchor.click() throws', async () => {
    vi.useFakeTimers();

    const urlStub = 'blob://oops';

    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(urlStub);
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    // Force click() to throw on ANY <a>
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('boom');
    });

    const blob = new Blob(['payload'], { type: 'image/png' });

    await expect(service.download('ERR', blob)).rejects.toThrow('boom');

    expect(revokeSpy).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });

  // --- Extra branches ---

  it('Flutter path: uses empty base64 when FileReader result is null', async () => {
    (window as any).FileReader = FileReaderNullResult as any;

    const callHandlerSpy = vi.fn().mockResolvedValue(undefined);
    window.flutter_inappwebview = { callHandler: callHandlerSpy };

    const blob = new Blob(['abc'], { type: 'image/png' });
    await service.download('NULLRES', blob);

    const [, payload] = callHandlerSpy.mock.calls[0] as any[];
    expect(payload.base64).toBe('');
    expect(payload.mime).toBe('image/png');
  });

  it('Flutter path: defaults mime to "image/png" when blob.type is empty', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = vi.fn().mockResolvedValue(undefined);
    window.flutter_inappwebview = { callHandler: callHandlerSpy };

    const blob = new Blob(['abc'], { type: '' });
    await service.download('DEFMIME', blob);

    const [, payload] = callHandlerSpy.mock.calls[0] as any[];
    expect(payload.mime).toBe('image/png');
    expect(payload.base64).toBe('QUJD');
  });

  it('Flutter path: propagates FileReader error', async () => {
    (window as any).FileReader = FileReaderError as any;

    const callHandlerSpy = vi.fn().mockResolvedValue(undefined);
    window.flutter_inappwebview = { callHandler: callHandlerSpy };

    const blob = new Blob(['abc'], { type: 'image/png' });

    await expect(service.download('ONERROR', blob)).rejects.toThrow();

    expect(callHandlerSpy).not.toHaveBeenCalled();
  });

  it('when data is null and Flutter bridge is absent: fetches via CertificateService then performs browser download', async () => {
    vi.useFakeTimers();

    const urlStub = 'blob://fetched';

    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(urlStub);
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    const anchor = originalCreateElement('a') as HTMLAnchorElement;
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation(((...args: any[]) => {
      const [tag] = args;
      if (tag === 'a') return anchor;
      return originalCreateElement(...(args as [any]));
    }) as any);

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const fetched = new Blob(['from-service'], { type: 'image/png' });
    certSvc.certificate.mockResolvedValue(fetched);

    await service.download('NULLWEB');

    expect(certSvc.certificate).toHaveBeenCalledTimes(1);
    expect(certSvc.certificate).toHaveBeenCalledWith('NULLWEB');

    expect(createObjectURLSpy).toHaveBeenCalledWith(fetched);
    expect(appendSpy).toHaveBeenCalledWith(anchor);

    expect(anchor.href).toBe(urlStub);
    expect(anchor.download).toBe('certificate_NULLWEB.png');

    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(removeSpy).toHaveBeenCalledWith(anchor);
    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });
});
