import {Injectable} from '@angular/core';
import {DeviceDetectorService, DeviceInfo} from './device-detector.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserDetectorService {

  private deviceInfo: DeviceInfo | null = null;

  constructor(private deviceService: DeviceDetectorService) {
  }

  init(): void {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    // console.log(this.deviceInfo);
  }

  iOS(): boolean {
    return this.deviceInfo?.os === 'iOS';
  }

}
