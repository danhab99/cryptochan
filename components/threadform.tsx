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
  const [form, setForm] = useState<{}>();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    debugger;
    e.preventDefault();

    if (form) {
      const formData = new FormData(e.target);

      // for (let [key, value] of Object.entries(form)) {
      //   formData.append(key, value);
      // }

      fetch("/api/upload", {
        method: "post",
        body: formData,
      }).then((resp) => {
        alert("Post complete");
        console.log(resp);
      });
    }
  };

  const handle = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("CHANGE", evt);
    setForm((prev) => ({
      ...prev,
      [evt.target.name]: evt.target.files || evt.target.value,
    }));
  };

  return (
    <form onSubmit={submit}>
      <table>
        <LabeldInput name="url" type="text" onChange={handle} />
        <tr>
          <td>
            <label for="body">body</label>
          </td>
          <td>
            <textarea name="body" cols={40} rows={4} onChange={handle} />
          </td>
        </tr>
        <LabeldInput name="public key" onChange={handle} />
        <LabeldInput name="reply to" onChange={handle} />
        <LabeldInput
          name="tags"
          placeholder="comma, seperated, words"
          onChange={handle}
        />
        <LabeldInput
          label={`embed up to ${policy.maxEmbeds} files`}
          name="embeds"
          type="file"
          accept={policy.embeds.join(",")}
          multiple={policy.maxEmbeds > 1}
          size={policy.maxSize}
          onChange={handle}
        />
      </table>

      <input type="submit" />
    </form>
  );
};

export default ThreadForm;
