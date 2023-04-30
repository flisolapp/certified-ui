import {TestBed} from '@angular/core/testing';

import {LanguageService} from './language.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MessageService} from 'primeng/api';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('LanguageService', () => {
  let service: LanguageService;

  // We declare the variables that we'll use for the Test Controller and for our Service
  let httpTestingController: HttpTestingController;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [MessageService]
    });

    // We inject our service (which imports the HttpClient) and the Test Controller
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LanguageService);
    messageService = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
