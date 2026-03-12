import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchResultTable } from './search-result-table';
import { SearchResultImagePreviewDialog } from './search-result-image-preview-dialog/search-result-image-preview-dialog';

import { CertificateService } from '../../../../services/certificate/certificate-service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { of, Subject } from 'rxjs';
import { CertificateElement } from '../../../../models/certificate-element/certificate-element';

describe('SearchResultTable', () => {
  let component: SearchResultTable;
  let fixture: ComponentFixture<SearchResultTable>;

  let certificateServiceMock: { certificate: ReturnType<typeof vi.fn> };
  let clipboardMock: { copy: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let translateMock: { get: ReturnType<typeof vi.fn> };

  const mockCertificate: CertificateElement = {
    edition: '2024',
    unit: { name: 'Unit Test', acronym: 'UT' },
    name: 'Test User',
    enjoyedAs: 'Participant',
    code: '123',
    download: 'http://example.com',
  } as any;

  beforeEach(async () => {
    certificateServiceMock = {
      certificate: vi.fn(),
    };

    clipboardMock = {
      copy: vi.fn(),
    };

    snackBarMock = {
      open: vi.fn(),
    };

    dialogMock = {
      open: vi.fn(),
    };

    translateMock = {
      get: vi.fn().mockReturnValue(of({ 'common.copied': 'Copied' })),
    };

    await TestBed.configureTestingModule({
      imports: [SearchResultTable],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CertificateService, useValue: certificateServiceMock },
        { provide: Clipboard, useValue: clipboardMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: TranslateService, useValue: translateMock },
      ],
    })
      // keep tests focused on class behavior
      .overrideComponent(SearchResultTable, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchResultTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('doCopyCodeToClipboard: copies code URL and shows snackbar', async () => {
    const content = `${window.location.origin}/${mockCertificate.code}`;

    component.doCopyCodeToClipboard(mockCertificate);

    // translate.get() emits synchronously (of(...)), so next() runs right away
    expect(translateMock.get).toHaveBeenCalledWith(['common.copied']);
    expect(clipboardMock.copy).toHaveBeenCalledWith(content);
    expect(snackBarMock.open).toHaveBeenCalledWith(`Copied: ${content}`, undefined, {
      duration: 1000,
    });
  });

  it('doPreview: downloads blob, opens dialog, revokes object URL after close, clears downloadingItem', async () => {
    const item = { code: 'XYZ789' } as CertificateElement;

    const blobMock = new Blob(['fake'], { type: 'image/png' });
    certificateServiceMock.certificate.mockResolvedValue(blobMock);

    const closed$ = new Subject<void>();
    dialogMock.open.mockReturnValue({
      afterClosed: () => closed$.asObservable(),
    } as any);

    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://fake-url');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const promise = component.doPreview(item);

    // during download/open dialog
    expect(component.downloadingItem()).toEqual(item);

    await promise;

    expect(certificateServiceMock.certificate).toHaveBeenCalledWith('XYZ789');
    expect(createUrlSpy).toHaveBeenCalledWith(blobMock);

    expect(dialogMock.open).toHaveBeenCalledWith(
      SearchResultImagePreviewDialog,
      expect.objectContaining({
        data: { imageUrl: 'blob://fake-url', code: 'XYZ789' },
        width: '800px',
      }),
    );

    // now emit "closed" to trigger revoke
    closed$.next();
    closed$.complete();

    expect(revokeSpy).toHaveBeenCalledWith('blob://fake-url');
    expect(component.downloadingItem()).toBeNull();
  });

  it('doPreview: logs error and clears downloadingItem when certificateService throws', async () => {
    const item = { code: 'XYZ789' } as CertificateElement;
    const error = new Error('Service error');

    certificateServiceMock.certificate.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await component.doPreview(item);

    expect(certificateServiceMock.certificate).toHaveBeenCalledWith('XYZ789');
    expect(consoleSpy).toHaveBeenCalledWith('Preview failed', error);
    expect(component.downloadingItem()).toBeNull();
  });
});
