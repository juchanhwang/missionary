import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionaryRegionEmptyState } from './MissionaryRegionEmptyState';

describe('MissionaryRegionEmptyState', () => {
  describe('type="empty"', () => {
    it('"등록된 연계지가 없습니다" 메시지를 표시한다', () => {
      render(<MissionaryRegionEmptyState type="empty" />);

      expect(screen.getByText('등록된 연계지가 없습니다')).toBeInTheDocument();
    });

    it('isAdmin이고 onCreateClick이 있으면 등록 버튼을 표시한다', async () => {
      const onCreateClick = vi.fn();
      const { user } = render(
        <MissionaryRegionEmptyState
          type="empty"
          isAdmin
          onCreateClick={onCreateClick}
        />,
      );

      const button = screen.getByRole('button', { name: /연계지 등록/ });
      expect(button).toBeInTheDocument();

      await user.click(button);
      expect(onCreateClick).toHaveBeenCalledTimes(1);
    });

    it('isAdmin이 false이면 등록 버튼을 표시하지 않는다', () => {
      render(
        <MissionaryRegionEmptyState
          type="empty"
          isAdmin={false}
          onCreateClick={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /연계지 등록/ }),
      ).not.toBeInTheDocument();
    });

    it('onCreateClick이 없으면 등록 버튼을 표시하지 않는다', () => {
      render(<MissionaryRegionEmptyState type="empty" isAdmin />);

      expect(
        screen.queryByRole('button', { name: /연계지 등록/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('type="no-results"', () => {
    it('"검색 결과가 없습니다" 메시지와 검색어를 표시한다', () => {
      render(<MissionaryRegionEmptyState type="no-results" query="서울교회" />);

      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText(/서울교회/)).toBeInTheDocument();
    });

    it('onClearSearch가 있으면 초기화 버튼을 표시한다', async () => {
      const onClearSearch = vi.fn();
      const { user } = render(
        <MissionaryRegionEmptyState
          type="no-results"
          query="서울교회"
          onClearSearch={onClearSearch}
        />,
      );

      const button = screen.getByRole('button', { name: '검색어 초기화' });
      await user.click(button);
      expect(onClearSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('type="error"', () => {
    it('"데이터를 불러오지 못했습니다" 메시지를 표시한다', () => {
      render(<MissionaryRegionEmptyState type="error" />);

      expect(
        screen.getByText('데이터를 불러오지 못했습니다'),
      ).toBeInTheDocument();
    });

    it('onRetry가 있으면 다시 시도 버튼을 표시한다', async () => {
      const onRetry = vi.fn();
      const { user } = render(
        <MissionaryRegionEmptyState type="error" onRetry={onRetry} />,
      );

      const button = screen.getByRole('button', { name: '다시 시도' });
      await user.click(button);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('onRetry가 없으면 다시 시도 버튼을 표시하지 않는다', () => {
      render(<MissionaryRegionEmptyState type="error" />);

      expect(
        screen.queryByRole('button', { name: '다시 시도' }),
      ).not.toBeInTheDocument();
    });
  });
});
