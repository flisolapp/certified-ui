import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchResultDownloadCertificateDialog } from './search-result-download-certificate-dialog';
import { MatDialogRef } from '@angular/material/dialog';

describe('SearchResultDownloadCertificateDialog', () => {
  let component: SearchResultDownloadCertificateDialog;

  const dialogRefMock = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultDownloadCertificateDialog],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    })
      // Template is irrelevant to this unit test and avoids TranslatePipe/module concerns
      .overrideComponent(SearchResultDownloadCertificateDialog, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(SearchResultDownloadCertificateDialog);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('close(): should call dialogRef.close()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });
});
