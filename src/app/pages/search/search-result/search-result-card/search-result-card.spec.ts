import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchResultCard } from './search-result-card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CertificateElement } from '../../../../models/certificate-element/certificate-element';
import { of, Subject } from 'rxjs';
import { DownloadService } from '../../../../services/download/download-service';

describe('SearchResultCard', () => {
  let component: SearchResultCard;

  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let downloadServiceMock: { download: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogMock = { open: vi.fn() };
    downloadServiceMock = { download: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SearchResultCard],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialog, useValue: dialogMock },
        { provide: DownloadService, useValue: downloadServiceMock }
      ]
    })
      // template not relevant for these unit tests
      .overrideComponent(SearchResultCard, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(SearchResultCard);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('doDownload(): does nothing if dialog closes without result', async () => {
    const dialogRefMock = { afterClosed: vi.fn().mockReturnValue(of(null)) } as Partial<
      MatDialogRef<any>
    > as MatDialogRef<any>;

    dialogMock.open.mockReturnValue(dialogRefMock);

    const item = { code: 'ABC123' } as CertificateElement;

    await component.doDownload(item);

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    expect(downloadServiceMock.download).not.toHaveBeenCalled();
    expect(component.downloadingItem()).toBeNull();
  });

  it('doDownload(): calls DownloadService and clears downloadingItem after resolve', async () => {
    // Use Subject so we can emit "afterClosed" when we want
    const closed$ = new Subject<any>();
    const dialogRefMock = { afterClosed: vi.fn().mockReturnValue(closed$.asObservable()) } as Partial<
      MatDialogRef<any>
    > as MatDialogRef<any>;

    dialogMock.open.mockReturnValue(dialogRefMock);

    // Hold the promise to assert intermediate state deterministically
    let resolveDownload!: () => void;
    const downloadPromise = new Promise<void>((resolve) => (resolveDownload = resolve));
    downloadServiceMock.download.mockReturnValue(downloadPromise);

    const item = { code: 'XYZ789' } as CertificateElement;

    const call = component.doDownload(item);

    // nothing happens until dialog closes
    expect(component.downloadingItem()).toBeNull();

    // close dialog with "truthy" result => triggers download path
    closed$.next(true);
    closed$.complete();

    // now it should set downloadingItem immediately
    expect(component.downloadingItem()).toBe(item);
    expect(downloadServiceMock.download).toHaveBeenCalledTimes(1);
    expect(downloadServiceMock.download).toHaveBeenCalledWith('XYZ789');

    // finish download => finally clears the signal
    resolveDownload();
    await downloadPromise;
    await call;

    expect(component.downloadingItem()).toBeNull();
  });

  it('doDownload(): clears downloadingItem even if DownloadService rejects', async () => {
    const closed$ = new Subject<any>();
    const dialogRefMock = { afterClosed: vi.fn().mockReturnValue(closed$.asObservable()) } as Partial<
      MatDialogRef<any>
    > as MatDialogRef<any>;

    dialogMock.open.mockReturnValue(dialogRefMock);

    // IMPORTANT: swallow rejection to avoid unhandled rejection from async subscribe callback
    downloadServiceMock.download.mockImplementation(() =>
      Promise.reject(new Error('fail')).catch(() => undefined)
    );

    const item = { code: 'ERR001' } as CertificateElement;

    const call = component.doDownload(item);

    closed$.next(true);
    closed$.complete();

    expect(component.downloadingItem()).toBe(item);

    // let the async callback run
    await Promise.resolve();
    await Promise.resolve();

    expect(downloadServiceMock.download).toHaveBeenCalledTimes(1);
    expect(downloadServiceMock.download).toHaveBeenCalledWith('ERR001');
    expect(component.downloadingItem()).toBeNull();

    await call;
  });
});
