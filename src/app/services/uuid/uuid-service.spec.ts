import { afterEach, describe, expect, it, vi } from 'vitest';
import { UuidService } from './uuid-service';

describe('UuidService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateUUID', () => {
    it('should generate a UUID of length 36', () => {
      const uuid = UuidService.generateUUID();
      expect(uuid).toHaveLength(36);
    });

    it('should generate a UUID containing hyphens at correct positions', () => {
      const uuid = UuidService.generateUUID();

      expect(uuid[8]).toBe('-');
      expect(uuid[13]).toBe('-');
      expect(uuid[18]).toBe('-');
      expect(uuid[23]).toBe('-');
    });

    it('should generate a UUID with version 4 at position 14', () => {
      const uuid = UuidService.generateUUID();
      expect(uuid[14]).toBe('4');
    });

    it('should generate a UUID with valid variant character at position 19', () => {
      const uuid = UuidService.generateUUID();
      expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
    });

    it('should generate different UUIDs on multiple calls', () => {
      const uuid1 = UuidService.generateUUID();
      const uuid2 = UuidService.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it('should match UUID v4 regex pattern', () => {
      const uuid = UuidService.generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate a deterministic UUID when Math.random is mocked', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const uuid = UuidService.generateUUID();

      expect(uuid).toBe('00000000-0000-4000-8000-000000000000');
    });
  });
});
