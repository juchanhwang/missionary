import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { TeamFilterBar } from './TeamFilterBar';

import type { TeamFilterState } from './types';
import type { RegionListItem } from 'apis/missionaryRegion';

function createRegion(overrides: Partial<RegionListItem> = {}): RegionListItem {
  return {
    id: 'region-1',
    name: '서울',
    pastorName: null,
    pastorPhone: null,
    addressBasic: null,
    addressDetail: null,
    note: null,
    missionGroupId: 'mg-1',
    missionGroup: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

const REGIONS = [
  createRegion({ id: 'region-1', name: '서울' }),
  createRegion({ id: 'region-2', name: '부산' }),
];

const EMPTY_FILTER: TeamFilterState = { query: '', regionId: '' };
const ACTIVE_FILTER: TeamFilterState = { query: '1팀', regionId: 'region-1' };

describe('TeamFilterBar', () => {
  it('검색 input 입력 시 onFilterChange가 호출된다', async () => {
    const onFilterChange = vi.fn();
    const { user } = render(
      <TeamFilterBar
        filter={EMPTY_FILTER}
        onFilterChange={onFilterChange}
        regions={REGIONS}
        filteredCount={3}
        totalCount={3}
      />,
    );

    await user.type(screen.getByTestId('team-filter-query'), '1');

    expect(onFilterChange).toHaveBeenLastCalledWith({
      query: '1',
      regionId: '',
    });
  });

  it('카운터 포맷을 렌더한다', () => {
    render(
      <TeamFilterBar
        filter={EMPTY_FILTER}
        onFilterChange={vi.fn()}
        regions={REGIONS}
        filteredCount={2}
        totalCount={5}
      />,
    );

    expect(screen.getByTestId('team-filter-counter')).toHaveTextContent(
      '2/5팀 표시 중',
    );
  });

  it('필터 미적용 시 초기화 버튼 disabled', () => {
    render(
      <TeamFilterBar
        filter={EMPTY_FILTER}
        onFilterChange={vi.fn()}
        regions={REGIONS}
        filteredCount={5}
        totalCount={5}
      />,
    );

    expect(screen.getByTestId('team-filter-reset')).toBeDisabled();
  });

  it('초기화 버튼 클릭 시 빈 state 전달', async () => {
    const onFilterChange = vi.fn();
    const { user } = render(
      <TeamFilterBar
        filter={ACTIVE_FILTER}
        onFilterChange={onFilterChange}
        regions={REGIONS}
        filteredCount={1}
        totalCount={5}
      />,
    );

    await user.click(screen.getByTestId('team-filter-reset'));

    expect(onFilterChange).toHaveBeenCalledWith({ query: '', regionId: '' });
  });
});
