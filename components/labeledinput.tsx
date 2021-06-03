import React, { InputHTMLAttributes, useRef } from "react";

interface LabeledRowProps {
  name?: string;
  label?: string;
}

export const LabeledRow: React.FC<LabeledRowProps> = (props) => {
  return (
    <tr>
      <td>
        <label htmlFor={props.name || ""}>{props.label}</label>
      </td>
      <td>{props.children}</td>
    </tr>
  );
};

export const LabeledInput: React.FC<
  LabeledRowProps & InputHTMLAttributes<HTMLInputElement>
> = (props) => {
  const defaultRef = useRef(Math.random().toString(36));

  return (
    <LabeledRow
      label={props.label || props.name || ""}
      name={props.name || defaultRef.current}
    >
      <input id={props.name || defaultRef.current} {...props} />
    </LabeledRow>
  );
};
