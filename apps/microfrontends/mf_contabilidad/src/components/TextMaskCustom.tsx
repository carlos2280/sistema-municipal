// TextMaskCustom.tsx
import React from 'react';
import { IMaskInput } from 'react-imask';

type TextMaskCustomProps = {
  name: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
  mask: string; // e.g. "111-00"
  maskChar?: string; // e.g. "_"
};

const TextMaskCustom = React.forwardRef<HTMLElement, TextMaskCustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, mask, maskChar = '_', ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={mask}
        placeholderChar={maskChar}
        inputRef={ref}
        overwrite
        onAccept={(value: string) => {
          onChange({ target: { name: props.name, value } });
        }}
      />
    );
  },
);

export default TextMaskCustom;
