/* eslint-disable react/display-name */
import React, { InputHTMLAttributes, useRef } from "react";
import styled from "styled-components";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  sizeClass?: string;
  fontClass?: string;
  rounded?: string;
  suffixIcon?: React.ReactNode;
  onSuffixClick?: (value: string) => void;
}

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SuffixIcon = styled.div`
  position: absolute;
  right: 52%;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const InputPrimary = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      sizeClass = "h-11 px-4 py-3",
      fontClass = "text-sm font-normal",
      rounded = "rounded-2xl",
      type = "text",
      suffixIcon,
      onSuffixClick,
      ...args
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSuffixClick = () => {
      if (inputRef.current) {
        const inputValue = inputRef.current.value;
        if (onSuffixClick) {
          onSuffixClick(inputValue);
        }
      }
    };

    return (
      <InputWrapper className={className}>
        <input
          ref={inputRef}
          type={type}
          className={`focus:border-primary-300 focus:ring-primary-200 dark:focus:ring-primary-6000 relative block w-full border-neutral-200 bg-white focus:ring focus:ring-opacity-50 disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-opacity-25 dark:disabled:bg-neutral-800 ${rounded} ${fontClass} ${sizeClass}`}
          {...args}
        />
        {suffixIcon && (
          <SuffixIcon onClick={handleSuffixClick}>{suffixIcon}</SuffixIcon>
        )}
      </InputWrapper>
    );
  },
);

export default InputPrimary;
