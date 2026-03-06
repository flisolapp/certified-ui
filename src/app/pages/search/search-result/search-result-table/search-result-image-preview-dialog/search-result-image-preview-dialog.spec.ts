import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchResultImagePreviewDialog } from './search-result-image-preview-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadService } from '../../../../../services/download/download-service';

describe('SearchResultImagePreviewDialog', () => {
  let component: SearchResultImagePreviewDialog;

  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let downloadServiceMock: { download: ReturnType<typeof vi.fn> };

  const dataMock = { imageUrl: 'https://example.com/image.png', code: 'CERT123' };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    downloadServiceMock = { download: vi.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [SearchResultImagePreviewDialog],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: DownloadService, useValue: downloadServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: dataMock }
      ]
    })
      // keep it as unit test (template irrelevant)
      .overrideComponent(SearchResultImagePreviewDialog, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(SearchResultImagePreviewDialog);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('close(): closes the dialog', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });

  it('download(): fetches the image blob and delegates to DownloadService', async () => {
    const blobMock = new Blob(['fake data'], { type: 'image/png' });
    const responseMock = new Response(blobMock);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(responseMock);

    await component.download();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/image.png');

    expect(downloadServiceMock.download).toHaveBeenCalledTimes(1);
    expect(downloadServiceMock.download).toHaveBeenCalledWith('CERT123', blobMock);
  });

  it('download(): propagates error when fetch fails and does not call DownloadService', async () => {
    const err = new Error('network down');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(err);

    await expect(component.download()).rejects.toThrow('network down');
    expect(downloadServiceMock.download).not.toHaveBeenCalled();
  });
});
