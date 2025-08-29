import {TestBed} from '@angular/core/testing';
import {CertificateService} from './certificate-service';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {provideZonelessChangeDetection} from '@angular/core';

describe('CertificateService', () => {
  let service: CertificateService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CertificateService,
        {provide: HttpClient, useValue: httpClientSpy},
      ],
    });

    service = TestBed.inject(CertificateService);
  });

  it('should be created and set baseUrl', () => {
    expect(service).toBeTruthy();
    expect((service as any)['baseUrl']).toBe(`${environment.apiUrl}/certificates`);
  });

  describe('search()', () => {
    it('calls HttpClient.get with the correct URL', () => {
      const term = 'test-term';
      const expected = {data: 'mockData'};
      httpClientSpy.get.and.returnValue(of(expected));

      service.search(term).subscribe(resp => {
        expect(resp).toEqual(expected);
      });

      expect(httpClientSpy.get)
        .toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${term}`);
    });
  });

  describe('certificate()', () => {
    it('fetches the Blob and returns it', async () => {
      const code = 'ABC123';
      const mockBlob = new Blob(['mock content'], {type: 'image/png'});
      const response = new Response(mockBlob);

      spyOn(window, 'fetch').and.returnValue(Promise.resolve(response));

      const blob = await service.certificate(code);

      expect(window.fetch)
        .toHaveBeenCalledOnceWith(`${environment.apiUrl}/certificates/${code}/download`);
      // compare by size/type since Blob equality is by reference
      expect(blob.size).toBe(mockBlob.size);
      expect(blob.type).toBe(mockBlob.type);
    });

    it('propagates errors if fetch rejects', async () => {
      const code = 'ERR001';
      const err = new Error('network down');

      spyOn(window, 'fetch').and.returnValue(Promise.reject(err));

      await expectAsync(service.certificate(code)).toBeRejectedWith(err);
      expect(window.fetch)
        .toHaveBeenCalledOnceWith(`${environment.apiUrl}/certificates/${code}/download`);
    });
  });
});
