import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchResultCard} from './search-result-card';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CertificateService} from '../../../../services/certificate/certificate-service';
import {CertificateElement} from '../../../../models/certificate-element/certificate-element';
import {of} from 'rxjs';
import {provideZonelessChangeDetection} from '@angular/core';

describe('SearchResultCard', () => {
  let component: SearchResultCard;
  let fixture: ComponentFixture<SearchResultCard>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;
  let certificateServiceMock: jasmine.SpyObj<CertificateService>;

  beforeEach(async () => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    certificateServiceMock = jasmine.createSpyObj('CertificateService', ['download']);

    await TestBed.configureTestingModule({
      imports: [SearchResultCard],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MatDialog, useValue: dialogMock},
        {provide: CertificateService, useValue: certificateServiceMock},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should do nothing if dialog is closed without result', async () => {
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(null));

    const item: CertificateElement = {code: 'ABC123'} as CertificateElement;

    await component.doDownload(item);

    expect(dialogMock.open).toHaveBeenCalled();
    expect(certificateServiceMock.download).not.toHaveBeenCalled();
  });

  it('should call download when dialog returns a result', async () => {
    dialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(true));

    const item: CertificateElement = {code: 'XYZ789'} as CertificateElement;

    await component.doDownload(item);

    expect(dialogMock.open).toHaveBeenCalled();
    expect(component.downloadingItem()).toBe(null);  // Confirma que limpou depois
    expect(certificateServiceMock.download).toHaveBeenCalledWith('XYZ789');
  });
});
