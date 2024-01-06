import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchResultDownloadCertificateComponent} from './search-result-download-certificate.component';

describe('SearchResultDownloadCertificateComponent', () => {
  let component: SearchResultDownloadCertificateComponent;
  let fixture: ComponentFixture<SearchResultDownloadCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchResultDownloadCertificateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchResultDownloadCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
