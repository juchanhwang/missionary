'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

export const PaginationRoot = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 4px;

  background-color: transparent;

  cursor: pointer;

  color: ${colors.gray70};

  &:hover {
    background-color: ${colors.gray98};
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;

    &:hover {
      background-color: transparent;
    }
  }
`;

export const PageNumber = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 4px;

  background-color: transparent;

  color: ${({ active }) => (active ? colors.black : colors.gray70)};
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 700 : 400)};
  line-height: 1.429;

  cursor: pointer;

  &:hover {
    background-color: ${colors.gray98};
  }
`;
