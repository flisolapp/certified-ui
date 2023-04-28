import {TestBed} from '@angular/core/testing';

import {SearchAnimationService} from './search-animation.service';

describe('SearchAnimationService', () => {
  let service: SearchAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
