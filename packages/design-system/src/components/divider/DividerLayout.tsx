'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

interface DividerLayoutProps {
  height: number;
}

export const DividerRoot = styled.div<DividerLayoutProps>`
  width: 100%;
  height: ${({ height }) => height}px;

  background-color: ${colors.gray95};
`;
