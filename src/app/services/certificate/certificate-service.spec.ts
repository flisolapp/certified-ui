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
        {provide: HttpClient, useValue: httpClientSpy}
      ]
    });

    service = TestBed.inject(CertificateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service['baseUrl']).toBe(environment.apiUrl + '/certificates');
  });

  describe('search', () => {
    it('should call httpClient.get with correct URL', () => {
      const term = 'test-term';
      const expectedResponse = {data: 'mockData'};

      httpClientSpy.get.and.returnValue(of(expectedResponse));

      service.search(term).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${term}`);
    });
  });

  describe('download', () => {
    let fetchSpy: jasmine.Spy;
    let createElementSpy: jasmine.Spy;
    let appendChildSpy: jasmine.Spy;
    let clickSpy: jasmine.Spy;
    let revokeObjectURLSpy: jasmine.Spy;

    beforeEach(() => {
      const mockBlob = new Blob(['mock content'], {type: 'image/png'});

      fetchSpy = spyOn(window, 'fetch').and.resolveTo({
        blob: async () => mockBlob
      } as Response);

      const anchorMock = {
        style: {display: ''},
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      };

      createElementSpy = spyOn(document, 'createElement').and.returnValue(anchorMock as unknown as HTMLAnchorElement);
      appendChildSpy = spyOn(document.body, 'appendChild');
      revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob://mock-url');

      clickSpy = anchorMock.click;
    });

    it('should fetch the certificate and trigger download', async () => {
      const code = 'ABC123';
      await service.download(code);

      expect(fetchSpy).toHaveBeenCalledWith(`${environment.apiUrl}/certificates/${code}/download`);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob://mock-url');
    });
  });
});
