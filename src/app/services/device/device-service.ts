import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  public static isIos(): boolean {
    const userAgent: string = window.navigator.userAgent || '';
    return /iPad|iPhone|iPod/i.test(userAgent);
  }
}
