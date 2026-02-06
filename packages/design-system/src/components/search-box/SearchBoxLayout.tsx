'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

export const SearchBoxRoot = styled.div`
  display: flex;
  align-items: center;

  padding: 10px 16px;
  border-radius: 8px;

  background-color: ${colors.gray98};

  input {
    flex: 1;

    border: 0;

    background-color: transparent;

    color: ${colors.black};
    font-size: 14px;
    line-height: 1.429;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: ${colors.gray70};
    }
  }

  svg {
    flex-shrink: 0;

    margin-left: 8px;

    color: ${colors.gray70};
  }
`;
