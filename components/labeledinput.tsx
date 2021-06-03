import React, { InputHTMLAttributes } from "react";

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
  return (
    <LabeledRow label={props.label || props.name} name={props.name}>
      <input id={props.name} {...props} />
    </LabeledRow>
  );
};
