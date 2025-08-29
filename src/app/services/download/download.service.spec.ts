import {TestBed} from '@angular/core/testing';
import {DownloadService} from './download.service';
import {CertificateService} from '../certificate/certificate-service';
import {provideZonelessChangeDetection} from '@angular/core';

class CertificateServiceMock {
  certificate = jasmine.createSpy('certificate');
}

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler(name: string, ...args: any[]): Promise<any>;
    };
  }
}

describe('DownloadService', () => {
  let service: DownloadService;
  let certSvc: CertificateServiceMock;

  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;
  const OriginalFileReader = (window as any).FileReader; // keep original FileReader

  class FakeFileReader {
    public result: unknown = null;
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(blob: Blob): void {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,QUJD`;
      // @ts-ignore
      this.onload?.call(this as any, {} as any);
    }
  }

  // Extra fakes to cover the remaining branches
  class FileReaderNullResult {
    public result: unknown = null;
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(_blob: Blob): void {
      // result stays null → String(r.result || '') === '' → split()[1] undefined → ?? '' yields ''
      this.onload?.call(this as any, {} as any);
    }
  }

  class FileReaderError {
    public result: unknown = null;
    public error: any = new Error('reader failed');
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL(_blob: Blob): void {
      // triggers r.onerror = () => reject(r.error)
      this.onerror?.call(this as any, {} as any);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        DownloadService,
        {provide: CertificateService, useClass: CertificateServiceMock},
      ],
    });

    service = TestBed.inject(DownloadService);
    certSvc = TestBed.inject(CertificateService) as unknown as CertificateServiceMock;
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    (document as any).createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    (window as any).FileReader = OriginalFileReader; // restore FileReader
    delete window.flutter_inappwebview;
  });

  it('hands off to Flutter InAppWebView...', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = jasmine.createSpy('callHandler').and.resolveTo(undefined);
    window.flutter_inappwebview = {
      callHandler: callHandlerSpy as unknown as (name: string, ...args: any[]) => Promise<any>,
    };

    const blob = new Blob(['abc'], {type: 'image/png'});
    await service.download('X123', blob);

    expect(certSvc.certificate).not.toHaveBeenCalled();
    const [handlerName, payload] = callHandlerSpy.calls.mostRecent().args as any[];
    expect(handlerName).toBe('downloadFile');
    expect(payload.name).toBe('certificate_X123.png');
    expect(payload.mime).toBe('image/png');
    expect(payload.base64).toBe('QUJD');
  });

  it('fetches the Blob when data is null, then hands off to Flutter', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = jasmine.createSpy('callHandler').and.resolveTo(undefined);
    window.flutter_inappwebview = {
      callHandler: callHandlerSpy as unknown as (name: string, ...args: any[]) => Promise<any>,
    };

    const fetched = new Blob(['xyz'], {type: 'image/png'});
    certSvc.certificate.and.resolveTo(fetched);

    await service.download('ABC', null);

    expect(certSvc.certificate).toHaveBeenCalledOnceWith('ABC');
    expect(callHandlerSpy).toHaveBeenCalled();
  });

  it('performs a regular browser download when Flutter bridge is absent', async () => {
    const urlStub = 'blob://test-object-url';
    const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue(urlStub);
    const revokeSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();

    // Use a REAL anchor element
    const realAnchor = document.createElement('a');
    spyOn(realAnchor, 'click').and.callFake(() => {
    });

    spyOn(document as any, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') return realAnchor;
      return originalCreateElement.call(document, tag);
    });

    const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();
    const removeSpy = spyOn(document.body, 'removeChild').and.callThrough();

    const blob = new Blob(['payload'], {type: 'image/png'});
    await service.download('DLD', blob);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(appendSpy).toHaveBeenCalledWith(realAnchor);
    expect(realAnchor.href).toBe(urlStub);
    expect(realAnchor.download).toBe('certificate_DLD.png');
    expect((realAnchor.click as any)).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(realAnchor);
    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });

  it('revokes object URL even if anchor.click() throws', async () => {
    const urlStub = 'blob://oops';
    spyOn(window.URL, 'createObjectURL').and.returnValue(urlStub);
    const revokeSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();

    // Force click() to throw on ANY <a>
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(() => {
      throw new Error('boom');
    });

    const blob = new Blob(['payload'], {type: 'image/png'});

    await expectAsync(service.download('ERR', blob)).toBeRejected();

    // finally{} executed
    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });

  // --- Extra branches ---

  it('Flutter path: uses empty base64 when FileReader result is null (covers r.result || "")', async () => {
    (window as any).FileReader = FileReaderNullResult as any;

    const callHandlerSpy = jasmine.createSpy('callHandler').and.resolveTo(undefined);
    window.flutter_inappwebview = {callHandler: callHandlerSpy as any};

    const blob = new Blob(['abc'], {type: 'image/png'});
    await service.download('NULLRES', blob);

    const [, payload] = callHandlerSpy.calls.mostRecent().args as any[];
    expect(payload.base64).toBe('');
    expect(payload.mime).toBe('image/png');
  });

  it('Flutter path: defaults mime to "image/png" when blob.type is empty (covers blob.type || "image/png")', async () => {
    (window as any).FileReader = FakeFileReader as any;

    const callHandlerSpy = jasmine.createSpy('callHandler').and.resolveTo(undefined);
    window.flutter_inappwebview = {callHandler: callHandlerSpy as any};

    const blob = new Blob(['abc'], {type: ''});
    await service.download('DEFMIME', blob);

    const [, payload] = callHandlerSpy.calls.mostRecent().args as any[];
    expect(payload.mime).toBe('image/png');
    expect(payload.base64).toBe('QUJD');
  });

  it('Flutter path: propagates FileReader error (covers r.onerror => reject(r.error))', async () => {
    (window as any).FileReader = FileReaderError as any;

    const callHandlerSpy = jasmine.createSpy('callHandler').and.resolveTo(undefined);
    window.flutter_inappwebview = {callHandler: callHandlerSpy as any};

    const blob = new Blob(['abc'], {type: 'image/png'});

    await expectAsync(service.download('ONERROR', blob)).toBeRejected();
    expect(callHandlerSpy).not.toHaveBeenCalled();
  });

  it('when data is null and Flutter bridge is absent: fetches via CertificateService then performs browser download', async () => {
    const urlStub = 'blob://fetched';
    const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue(urlStub);
    const revokeSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();

    const anchor = document.createElement('a');
    spyOn(anchor, 'click').and.callFake(() => {
    });
    spyOn(document as any, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') return anchor;
      return originalCreateElement.call(document, tag);
    });

    const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();
    const removeSpy = spyOn(document.body, 'removeChild').and.callThrough();

    const fetched = new Blob(['from-service'], {type: 'image/png'});
    certSvc.certificate.and.resolveTo(fetched);

    await service.download('NULLWEB');

    expect(certSvc.certificate).toHaveBeenCalledOnceWith('NULLWEB');
    expect(createObjectURLSpy).toHaveBeenCalledWith(fetched);
    expect(appendSpy).toHaveBeenCalledWith(anchor);
    expect(anchor.href).toBe(urlStub);
    expect(anchor.download).toBe('certificate_NULLWEB.png');
    expect((anchor.click as any)).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(anchor);
    expect(revokeSpy).toHaveBeenCalledWith(urlStub);
  });
});
