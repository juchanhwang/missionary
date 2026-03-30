import { http, HttpResponse } from 'msw';
import { createMockAttendanceOption } from 'test/mocks/data';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';

import { AttendanceFieldCard } from './AttendanceFieldCard';

describe('AttendanceFieldCard', () => {
  const fullOption = createMockAttendanceOption({
    id: 'att-1',
    type: 'FULL',
    label: '전체 참석',
  });
  const partialOption = createMockAttendanceOption({
    id: 'att-2',
    type: 'PARTIAL',
    label: '1주차만 참석',
  });

  it('헤더에 "참석 일정"과 옵션 개수를 렌더링한다', () => {
    render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption, partialOption]}
      />,
    );

    expect(screen.getByText('참석 일정')).toBeInTheDocument();
    expect(screen.getByText('옵션 2개')).toBeInTheDocument();
  });

  it('기본 상태에서 옵션 목록이 숨겨져 있다', () => {
    render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption]}
      />,
    );

    expect(screen.queryByDisplayValue('전체 참석')).not.toBeInTheDocument();
  });

  it('헤더 클릭 시 옵션 목록이 펼쳐진다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption, partialOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.getByDisplayValue('전체 참석')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1주차만 참석')).toBeInTheDocument();
  });

  it('FULL 타입 옵션에는 삭제 버튼이 없다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.queryByLabelText('전체 참석 삭제')).not.toBeInTheDocument();
  });

  it('PARTIAL 타입 옵션에는 삭제 버튼이 있다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[partialOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.getByLabelText('1주차만 참석 삭제')).toBeInTheDocument();
  });

  it('타입 뱃지를 올바르게 표시한다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption, partialOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('부분')).toBeInTheDocument();
  });

  it('"부분 참석 추가" 버튼이 존재한다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.getByText('부분 참석 추가')).toBeInTheDocument();
  });

  it('"전체 참석 추가" 버튼은 존재하지 않는다', async () => {
    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.queryByText('전체 참석 추가')).not.toBeInTheDocument();
  });

  it('옵션이 없을 때 안내 메시지를 표시한다', async () => {
    const { user } = render(
      <AttendanceFieldCard missionaryId="m1" attendanceOptions={[]} />,
    );

    await user.click(screen.getByText('참석 일정'));

    expect(screen.getByText(/참석 옵션이 없습니다/)).toBeInTheDocument();
  });

  it('"부분 참석 추가" 클릭 시 API를 호출한다', async () => {
    let apiCalled = false;
    server.use(
      http.post(
        'http://localhost/missionaries/:id/attendance-options',
        async ({ request }) => {
          const body = (await request.json()) as { type: string };
          if (body.type === 'PARTIAL') {
            apiCalled = true;
          }
          return HttpResponse.json(
            createMockAttendanceOption({ id: 'new', type: 'PARTIAL' }),
            { status: 201 },
          );
        },
      ),
    );

    const { user } = render(
      <AttendanceFieldCard
        missionaryId="m1"
        attendanceOptions={[fullOption]}
      />,
    );

    await user.click(screen.getByText('참석 일정'));
    await user.click(screen.getByText('부분 참석 추가'));

    await waitFor(() => {
      expect(apiCalled).toBe(true);
    });
  });
});
