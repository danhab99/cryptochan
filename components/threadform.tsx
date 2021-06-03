import React, { useState } from "react";
import _ from "lodash";
import { GetPolicy } from "../policy";
import { LabeledInput, LabeledRow } from "./labeledinput";

interface ThreadFormProps {}

const ThreadForm: React.FC<ThreadFormProps> = () => {
  const policy = GetPolicy();
  const [form, setForm] = useState<{}>();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form) {
      const formData = new FormData();

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
    evt: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [evt.target.name]: /* evt.target.files || */ evt.target.value,
    }));
  };

  return (
    <div>
      <form onSubmit={submit}>
        <table>
          <LabeledInput name="url" type="text" onChange={handle} />
          <LabeledRow name="body" label="body">
            <textarea name="body" cols={50} rows={4} onChange={handle} />
          </LabeledRow>
          <LabeledRow label="private key">
            <div className="flex">
              <input type="file" accept="application/pgp-keys" />
              <a
                href="/newkeys"
                className="whitespace-nowrap text-primary-500 text-sm pr-1"
              >
                Generate keys
              </a>
            </div>
          </LabeledRow>
          <LabeledInput name="reply to" onChange={handle} />
          <LabeledRow label="category">
            <select onChange={handle} name="category">
              {policy.categories.map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </LabeledRow>
          <LabeledInput
            name="tags"
            placeholder="comma, seperated, words"
            onChange={handle}
          />
          <LabeledInput
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
    </div>
  );
};

export default ThreadForm;
