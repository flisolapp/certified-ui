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

}
