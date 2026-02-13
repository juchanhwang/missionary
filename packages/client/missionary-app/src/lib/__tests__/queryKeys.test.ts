import { describe, it, expect } from 'vitest';

import { queryKeys } from '../queryKeys';

describe('queryKeys', () => {
  describe('auth', () => {
    it('all returns base key', () => {
      expect(queryKeys.auth.all).toEqual(['auth']);
    });
    it('me returns auth.me key', () => {
      expect(queryKeys.auth.me()).toEqual(['auth', 'me']);
    });
  });

  describe('missionaries', () => {
    it('list returns missionaries.list key', () => {
      expect(queryKeys.missionaries.list()).toEqual(['missionaries', 'list']);
    });
    it('detail returns missionaries.detail key with id', () => {
      expect(queryKeys.missionaries.detail('123')).toEqual([
        'missionaries',
        'detail',
        '123',
      ]);
    });
  });

  describe('missionGroups', () => {
    it('list returns missionGroups.list key', () => {
      expect(queryKeys.missionGroups.list()).toEqual(['missionGroups', 'list']);
    });
    it('detail returns missionGroups.detail key with id', () => {
      expect(queryKeys.missionGroups.detail('456')).toEqual([
        'missionGroups',
        'detail',
        '456',
      ]);
    });
  });
});
