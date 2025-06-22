import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private readonly baseUrl: string | null = null;

  constructor(
    private httpClient: HttpClient
  ) {
    this.baseUrl = environment.apiUrl + '/certificates';
  }

  public search(term: string): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + '/' + term);
  }

  public async certificate(code: string): Promise<Blob> {
    const url: string = this.baseUrl + '/' + code + '/download';

    const response = await fetch(url);
    return await response.blob();
  }

  public async download(code: string, data: Blob | null = null): Promise<void> {
    const name: string = 'certificate_' + code + '.png';
    const blob: Blob | null = (data instanceof Blob) ? data : await this.certificate(code);

    const url_1: string = window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.style.display = 'none';
    a.href = url_1;
    // the filename you want
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url_1);
  }

}
