import { getParticipationSubText } from './getParticipationSubText';

describe('getParticipationSubText', () => {
  it('cohort와 affiliation이 모두 있으면 "N기 · 소속" 형식을 반환한다', () => {
    expect(getParticipationSubText({ cohort: 12, affiliation: '대학부' })).toBe(
      '12기 · 대학부',
    );
  });

  it('cohort만 있으면 기수만 반환한다', () => {
    expect(getParticipationSubText({ cohort: 12, affiliation: '' })).toBe(
      '12기',
    );
  });

  it('affiliation만 있으면 소속만 반환한다', () => {
    expect(getParticipationSubText({ cohort: 0, affiliation: '대학부' })).toBe(
      '대학부',
    );
  });

  it('둘 다 비어있으면 null을 반환한다', () => {
    expect(getParticipationSubText({ cohort: 0, affiliation: '' })).toBeNull();
  });

  it('affiliation이 공백만 있으면 비어있는 것으로 처리한다', () => {
    expect(
      getParticipationSubText({ cohort: 0, affiliation: '   ' }),
    ).toBeNull();
  });
});
