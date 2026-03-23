import { describe, it, expect } from 'vitest';
import { normalizeProjectPath } from '../getProjectSessionsPath';

describe('getProjectSessionsPath', () => {
  describe('normalizeProjectPath()', () => {
    it('should replace forward slashes with hyphens', () => {
      expect(normalizeProjectPath('/home/user/project')).toBe('-home-user-project');
    });

    it('should replace backslashes with hyphens', () => {
      expect(normalizeProjectPath('C:\\Users\\admin\\project')).toBe('C--Users-admin-project');
    });

    it('should keep alphanumeric characters unchanged', () => {
      expect(normalizeProjectPath('myProject123')).toBe('myProject123');
    });

    it('should replace spaces with hyphens', () => {
      expect(normalizeProjectPath('/home/user/my project')).toBe('-home-user-my-project');
    });

    it('should replace special characters with hyphens', () => {
      expect(normalizeProjectPath('/home/user/project@v2')).toBe('-home-user-project-v2');
    });

    it('should handle trailing slash', () => {
      expect(normalizeProjectPath('/home/user/project/')).toBe('-home-user-project-');
    });

    it('should handle home directory tilde', () => {
      // tilde is non-alphanumeric, so it's replaced with '-'
      expect(normalizeProjectPath('~/project')).toBe('--project');
    });

    it('should handle dots in path', () => {
      expect(normalizeProjectPath('/home/user/.config/app')).toBe('-home-user--config-app');
    });

    it('should handle empty string', () => {
      expect(normalizeProjectPath('')).toBe('');
    });

    it('should handle path with multiple consecutive special chars', () => {
      expect(normalizeProjectPath('/home//user')).toBe('-home--user');
    });
  });
});
