'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

export const ChipsRoot = styled.span`
  display: inline-flex;
  align-items: center;

  padding: 6px 12px;
  border-radius: 16px;

  background-color: ${colors.gray95};

  color: ${colors.black};
  font-size: 14px;
  line-height: 1.429;
  white-space: nowrap;
`;
