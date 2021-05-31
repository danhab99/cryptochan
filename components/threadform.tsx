import React, { InputHTMLAttributes, useState } from "react";
import _ from "lodash";
import { GetPolicy } from "../policy";

interface LabeledInputProps {
  name: string;
  label?: string;
}

const LabeldInput: React.FC<
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

interface ThreadFormProps {}

const ThreadForm: React.FC<ThreadFormProps> = (props) => {
  const policy = GetPolicy();

  return (
    <form>
      <table>
        <LabeldInput name="url" type="text" />
        <tr>
          <td>
            <label for="body">body</label>
          </td>
          <td>
            <textarea name="body" cols={40} rows={4} />
          </td>
        </tr>
        <LabeldInput name="public key" />
        <LabeldInput name="reply to" />
        <LabeldInput name="tags" placeholder="comma, seperated, words" />
        <LabeldInput
          label={`embed up to ${policy.maxEmbeds} files`}
          name="embeds"
          type="file"
          accept={policy.embeds.join(",")}
          multiple={policy.maxEmbeds > 1}
          size={policy.maxSize}
        />
      </table>

      <input type="submit" />
    </form>
  );
};

export default ThreadForm;
