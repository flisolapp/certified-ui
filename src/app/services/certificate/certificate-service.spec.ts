import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CertificateService } from './certificate-service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('CertificateService', () => {
  let service: CertificateService;

  let httpClientMock: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CertificateService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(CertificateService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created and set baseUrl', () => {
    expect(service).toBeDefined();
    expect((service as any)['baseUrl']).toBe(`${environment.apiUrl}/certificates`);
  });

  describe('search()', () => {
    it('calls HttpClient.get with the correct URL', () => {
      const term = 'test-term';
      const expected = { data: 'mockData' };

      httpClientMock.get.mockReturnValue(of(expected));

      service.search(term).subscribe((resp) => {
        expect(resp).toEqual(expected);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${term}`);
    });
  });

  describe('certificate()', () => {
    it('fetches the Blob and returns it', async () => {
      const code = 'ABC123';
      const mockBlob = new Blob(['mock content'], { type: 'image/png' });

      // Response(blob) is supported in jsdom
      const response = {
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(response as any);

      const blob = await service.certificate(code);

      expect(fetchSpy).toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${code}/download`);

      // compare by size/type since Blob equality is by reference
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('propagates errors if fetch rejects', async () => {
      const code = 'ERR001';
      const err = new Error('network down');

      const fetchSpy = vi.spyOn(window, 'fetch').mockRejectedValue(err);

      await expect(service.certificate(code)).rejects.toBe(err);

      expect(fetchSpy).toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${code}/download`);
    });
  });
});
