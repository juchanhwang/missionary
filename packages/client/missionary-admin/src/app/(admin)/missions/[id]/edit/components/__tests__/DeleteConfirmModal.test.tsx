'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { DeleteConfirmModal } from '../DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const mockClose = vi.fn();
  const missionaryName = '테스트 선교';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
      />,
    );

    expect(
      screen.getByText(/정말 '테스트 선교' 선교를 삭제하시겠습니까?/),
    ).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        close={mockClose}
        missionaryName={missionaryName}
      />,
    );

    const modalContent = container.querySelector('.ReactModal__Content');
    expect(modalContent).not.toBeInTheDocument();
  });

  it('should call close(true) when confirm button is clicked', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
      />,
    );

    const confirmButton = screen.getByRole('button', {
      name: '삭제',
      hidden: true,
    });
    fireEvent.click(confirmButton);

    expect(mockClose).toHaveBeenCalledWith(true);
  });

  it('should call close(false) when cancel button is clicked', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
      />,
    );

    const cancelButton = screen.getByRole('button', {
      name: '취소',
      hidden: true,
    });
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalledWith(false);
  });

  it('should display missionary name in the message', () => {
    const customName = '특별 선교';
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={customName}
      />,
    );

    expect(
      screen.getByText(/정말 '특별 선교' 선교를 삭제하시겠습니까?/),
    ).toBeInTheDocument();
  });

  it('should disable buttons when isPending is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
        isPending={true}
      />,
    );

    const confirmButton = screen.getByRole('button', {
      name: '삭제',
      hidden: true,
    });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable buttons when isPending is false', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
        isPending={false}
      />,
    );

    const confirmButton = screen.getByRole('button', {
      name: '삭제',
      hidden: true,
    });
    expect(confirmButton).not.toBeDisabled();
  });

  it('should call close(false) when modal overlay is clicked', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName={missionaryName}
      />,
    );

    const overlay = document.querySelector('.ReactModal__Overlay');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockClose).toHaveBeenCalledWith(false);
  });
});
