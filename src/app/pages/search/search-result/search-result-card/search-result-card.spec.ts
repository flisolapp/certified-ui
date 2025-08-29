import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResultCard} from './search-result-card';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CertificateElement} from '../../../../models/certificate-element/certificate-element';
import {of} from 'rxjs';
import {provideZonelessChangeDetection} from '@angular/core';
import {DownloadService} from '../../../../services/download/download.service';

// Simple microtask flusher for zoneless tests
const flushMicrotasks = async (times = 2) => {
  for (let i = 0; i < times; i++) await Promise.resolve();
};

describe('SearchResultCard (zoneless)', () => {
  let component: SearchResultCard;
  let fixture: ComponentFixture<SearchResultCard>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;
  let downloadServiceMock: jasmine.SpyObj<DownloadService>;

  beforeEach(async () => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    downloadServiceMock = jasmine.createSpyObj('DownloadService', ['download']);

    await TestBed.configureTestingModule({
      imports: [SearchResultCard],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialog, useValue: dialogMock},
        {provide: DownloadService, useValue: downloadServiceMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doDownload(): does nothing if dialog closes without result (zoneless)', async () => {
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(null));

    const item = {code: 'ABC123'} as CertificateElement;

    component.doDownload(item);
    await flushMicrotasks(); // allow subscription/microtasks (even though none should run)

    expect(dialogMock.open).toHaveBeenCalled();
    expect(downloadServiceMock.download).not.toHaveBeenCalled();
    expect(component.downloadingItem()).toBeNull();
  });

  it('doDownload(): calls DownloadService and resets downloadingItem (zoneless)', async () => {
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(true));
    downloadServiceMock.download.and.returnValue(Promise.resolve());

    const item = {code: 'XYZ789'} as CertificateElement;

    component.doDownload(item);

    // afterClosed emits synchronously; subscription sets downloadingItem immediately
    expect(component.downloadingItem()).toBe(item);

    // let the awaited download() resolve and finally{} clear the signal
    await flushMicrotasks();

    expect(downloadServiceMock.download).toHaveBeenCalledOnceWith('XYZ789');
    expect(component.downloadingItem()).toBeNull();
  });

  it('doDownload(): clears downloadingItem even if DownloadService rejects (zoneless)', async () => {
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(true));

    // swallow rejection to avoid unhandled promise in test env
    downloadServiceMock.download.and.callFake(() =>
      Promise.reject(new Error('fail')).catch(() => {
      })
    );

    const item = {code: 'ERR001'} as CertificateElement;

    component.doDownload(item);
    expect(component.downloadingItem()).toBe(item);

    await flushMicrotasks();

    expect(downloadServiceMock.download).toHaveBeenCalledOnceWith('ERR001');
    expect(component.downloadingItem()).toBeNull();
  });
});
