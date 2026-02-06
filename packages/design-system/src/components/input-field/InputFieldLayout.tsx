'use client';

import styled from '@emotion/styled';
import { colors } from '@styles/color';

export const InputFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InputFieldLabel = styled.label`
  margin-bottom: 8px;

  color: ${colors.gray30};
  font-size: 14px;
  font-weight: 700;
  line-height: 1.429;
`;

export const InputFieldBox = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;

  padding: 13px 16px;
  border-radius: 8px;

  background-color: ${({ disabled }) =>
    disabled ? colors.gray95 : colors.gray98};

  input {
    flex: 1;

    border: 0;

    background-color: transparent;

    color: ${colors.black};
    font-size: 12px;
    line-height: 1.5;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: ${colors.gray70};
    }

    &:disabled {
      color: ${colors.primary70};
    }
  }
`;

export const InputFieldCounter = styled.span`
  flex-shrink: 0;

  margin-left: 8px;

  color: ${colors.gray70};
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
`;

export const InputFieldError = styled.div`
  margin-top: 5px;

  color: ${colors.error40};
  font-size: 12px;
  line-height: 1.5;
`;
