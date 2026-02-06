'use client';

import styled from '@emotion/styled';

interface BadgeRootProps {
  backgroundColor: string;
  textColor: string;
}

export const BadgeRoot = styled.span<BadgeRootProps>`
  display: inline-flex;
  align-items: center;

  padding: 4px 8px;
  border-radius: 4px;

  background-color: ${({ backgroundColor }) => backgroundColor};

  color: ${({ textColor }) => textColor};
  font-size: 14px;
  font-weight: 700;
  line-height: 1.429;
  white-space: nowrap;
`;
