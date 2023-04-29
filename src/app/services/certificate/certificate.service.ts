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

  public download(code: string): Promise<void> {
    const url: string = this.baseUrl + '/' + code + '/download';
    const name: string = 'certificate_' + code + '.png';

    return fetch(url)
      .then((response: Response) => response.blob())
      .then((blob: Blob): void => {
        const url: string = window.URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // the filename you want
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

}
