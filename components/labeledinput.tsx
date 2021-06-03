import React, { InputHTMLAttributes } from "react";

interface LabeledInputProps {
  name: string;
  label?: string;
}
export const LabeldInput: React.FC<
  LabeledInputProps & InputHTMLAttributes<HTMLInputElement>
> = (props) => {
  return (
    <tr>
      <td>
        <label for={props.name}>{props.label || props.name}</label>
      </td>
      <td>
        <input id={props.name} {...props} />
      </td>
    </tr>
  );
};
