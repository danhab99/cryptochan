import React, { useState } from "react";
import _ from "lodash";
import { GetPolicy } from "../policy";
import { LabeldInput } from "./labeledinput";

interface ThreadFormProps {}

const ThreadForm: React.FC<ThreadFormProps> = (props) => {
  const policy = GetPolicy();
  const [form, setForm] = useState<{}>();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
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
    setForm((prev) => ({
      ...prev,
      [evt.target.name]: evt.target.files || evt.target.value,
    }));
  };

  return (
    <div>
      <form onSubmit={submit}>
        <table>
          <LabeldInput name="url" type="text" onChange={handle} />
          <tr>
            <td>
              <label for="body">body</label>
            </td>
            <td>
              <textarea name="body" cols={50} rows={4} onChange={handle} />
            </td>
          </tr>
          <tr>
            <td>
              <label>Private key</label>
            </td>
            <td className="flex">
              <input type="file" accept="application/pgp-keys" />
              <a
                href="/newkeys"
                className="whitespace-nowrap text-primary-500 text-sm pr-1"
              >
                Generate keys
              </a>
            </td>
          </tr>
          <LabeldInput name="reply to" onChange={handle} />
          <tr>
            <td>
              <label>Category</label>
            </td>
            <td>
              <select>
                {policy.categories.map((x) => (
                  <option>{x}</option>
                ))}
              </select>
            </td>
          </tr>
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
    </div>
  );
};

export default ThreadForm;
