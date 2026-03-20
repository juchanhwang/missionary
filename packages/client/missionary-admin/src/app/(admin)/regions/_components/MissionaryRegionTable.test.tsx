import { createMockRegion, createMockRegionList } from 'test/mocks/data';
import { render, screen, within } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionaryRegionTable } from './MissionaryRegionTable';

const defaultProps = {
  regions: createMockRegionList(2),
  isLoading: false,
  isAdmin: true,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('MissionaryRegionTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('테이블 헤더 7개 컬럼을 렌더링한다 (isAdmin=true)', () => {
    render(<MissionaryRegionTable {...defaultProps} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers.map((h) => h.textContent)).toEqual([
      '선교 그룹',
      '차수',
      '연계지',
      '목사명',
      '목사연락처',
      '주소',
      '액션',
    ]);
  });

  it('데이터 행을 올바르게 렌더링한다', () => {
    const region = createMockRegion({
      name: '부산교회',
      pastorName: '박목사',
      pastorPhone: '010-9999-8888',
      missionary: {
        id: 'm1',
        name: '2차 선교',
        order: 2,
        missionGroup: { id: 'g1', name: '인도 선교' },
      },
    });

    render(<MissionaryRegionTable {...defaultProps} regions={[region]} />);

    const rows = screen.getAllByRole('row');
    // 헤더 1행 + 데이터 1행
    expect(rows).toHaveLength(2);

    const dataRow = rows[1];
    const cells = within(dataRow).getAllByRole('cell');

    expect(cells[0]).toHaveTextContent('인도 선교');
    expect(cells[1]).toHaveTextContent('2');
    expect(cells[2]).toHaveTextContent('부산교회');
    expect(cells[3]).toHaveTextContent('박목사');
    expect(cells[4]).toHaveTextContent('010-9999-8888');
  });

  it('isAdmin=false이면 액션 컬럼이 표시되지 않는다 (6컬럼)', () => {
    render(<MissionaryRegionTable {...defaultProps} isAdmin={false} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers.map((h) => h.textContent)).not.toContain('액션');
  });

  it('isAdmin=true일 때 삭제 버튼을 클릭하면 onDelete가 호출된다', async () => {
    const onDelete = vi.fn();
    const region = createMockRegion({ name: '대전교회' });

    const { user } = render(
      <MissionaryRegionTable
        {...defaultProps}
        regions={[region]}
        onDelete={onDelete}
      />,
    );

    const deleteButton = screen.getByRole('button', {
      name: '대전교회 삭제',
    });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(region);
  });

  describe('로딩 상태', () => {
    it('isLoading=true이면 스켈레톤을 표시한다', () => {
      render(
        <MissionaryRegionTable {...defaultProps} isLoading regions={[]} />,
      );

      // 스켈레톤: 5행 × 7컬럼(isAdmin) = 35 셀
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(35);
    });

    it('isAdmin=false이면 스켈레톤 컬럼이 6개이다', () => {
      render(
        <MissionaryRegionTable
          {...defaultProps}
          isLoading
          isAdmin={false}
          regions={[]}
        />,
      );

      // 스켈레톤: 5행 × 6컬럼 = 30 셀
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(30);
    });
  });

  it('null 값은 "—"으로 표시한다', () => {
    const region = createMockRegion({
      pastorName: null,
      pastorPhone: null,
    });

    render(<MissionaryRegionTable {...defaultProps} regions={[region]} />);

    const rows = screen.getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');

    // 목사명, 목사연락처
    expect(cells[3]).toHaveTextContent('—');
    expect(cells[4]).toHaveTextContent('—');
  });
});
