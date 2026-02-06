'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

export const TopButtonRoot = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid ${colors.gray95};
  border-radius: 50%;

  background-color: ${colors.white};

  opacity: 0.7;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;
