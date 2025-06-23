import { PlatformService } from './platform-service';
import { Platform } from '@angular/cdk/platform';

describe('PlatformService', () => {
  let service: PlatformService;

  class MockPlatform {
    ANDROID = false;
    IOS = false;
  }

  let platformMock: MockPlatform;

  beforeEach(() => {
    platformMock = new MockPlatform();
    service = new PlatformService(platformMock as unknown as Platform);
  });

  describe('isDesktop', () => {
    it('should return true when not Android and not IOS', () => {
      platformMock.ANDROID = false;
      platformMock.IOS = false;
      expect(service.isDesktop()).toBeTrue();
    });

    it('should return false when Android', () => {
      platformMock.ANDROID = true;
      platformMock.IOS = false;
      expect(service.isDesktop()).toBeFalse();
    });

    it('should return false when IOS', () => {
      platformMock.ANDROID = false;
      platformMock.IOS = true;
      expect(service.isDesktop()).toBeFalse();
    });
  });

  describe('isMobile', () => {
    it('should return true when Android', () => {
      platformMock.ANDROID = true;
      platformMock.IOS = false;
      expect(service.isMobile()).toBeTrue();
    });

    it('should return true when IOS', () => {
      platformMock.ANDROID = false;
      platformMock.IOS = true;
      expect(service.isMobile()).toBeTrue();
    });

    it('should return false when neither Android nor IOS', () => {
      platformMock.ANDROID = false;
      platformMock.IOS = false;
      expect(service.isMobile()).toBeFalse();
    });
  });
});
