import { describe, it, expect } from 'vitest';

import { filterTeams, type FilterableTeam } from './filterTeams';

const baseTeams: FilterableTeam[] = [
  { teamName: '1팀 알파', missionaryRegionId: 'region-a' },
  { teamName: '2팀 베타', missionaryRegionId: 'region-b' },
  { teamName: '3팀 ALPHA', missionaryRegionId: null },
  { teamName: '청년부', missionaryRegionId: 'region-a' },
];

describe('filterTeams', () => {
  it('필터가 비어 있으면 원본 배열을 그대로 반환한다', () => {
    const result = filterTeams(baseTeams, { query: '', regionId: '' });
    expect(result).toBe(baseTeams);
  });

  it('팀명을 대소문자 무시하고 부분일치로 거른다', () => {
    const result = filterTeams(baseTeams, { query: 'alpha', regionId: '' });
    // Latin 'alpha'는 Hangul '알파'와 다른 문자열이므로 'ALPHA'만 매치된다.
    expect(result.map((t) => t.teamName)).toEqual(['3팀 ALPHA']);
  });

  it('한글 팀명 검색이 가능하다', () => {
    const result = filterTeams(baseTeams, { query: '청년', regionId: '' });
    expect(result.map((t) => t.teamName)).toEqual(['청년부']);
  });

  it('연계지 ID로 정확 일치 필터링한다', () => {
    const result = filterTeams(baseTeams, { query: '', regionId: 'region-a' });
    expect(result.map((t) => t.teamName)).toEqual(['1팀 알파', '청년부']);
  });

  it('연계지가 null인 팀은 region 필터가 있을 때 제외된다', () => {
    const result = filterTeams(baseTeams, { query: '', regionId: 'region-b' });
    expect(result.map((t) => t.teamName)).toEqual(['2팀 베타']);
  });

  it('팀명 + 연계지 조합 필터가 AND로 동작한다', () => {
    const result = filterTeams(baseTeams, {
      query: '팀',
      regionId: 'region-a',
    });
    expect(result.map((t) => t.teamName)).toEqual(['1팀 알파']);
  });

  it('검색어 앞뒤 공백을 무시한다', () => {
    const result = filterTeams(baseTeams, {
      query: '   알파  ',
      regionId: '',
    });
    expect(result.map((t) => t.teamName)).toEqual(['1팀 알파']);
  });

  it('일치하는 팀이 없으면 빈 배열을 반환한다', () => {
    const result = filterTeams(baseTeams, {
      query: '존재하지않는팀',
      regionId: '',
    });
    expect(result).toEqual([]);
  });
});
