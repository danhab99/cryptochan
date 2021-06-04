import React, { useState } from "react";
import _ from "lodash";
import prettyBytes from "pretty-bytes";
import * as openpgp from "openpgp";
import { GetPolicy } from "../policy";
import { LabeledInput, LabeledRow } from "./labeledinput";
import { EntrySignature, HashArrayBuffer, SignEntry } from "../crypto";
import { IEmbed } from "../schemas/Entry";

interface ThreadFormProps {}

const policy = GetPolicy();

const ThreadForm: React.FC<ThreadFormProps> = () => {
  const [form, setForm] = useState<Record<string, any>>();
  const [submitting, setSubmitting] = useState(false);
  const [skFile, setSkFile] = useState<File>();
  const [skPassword, setSkPassword] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form) {
      setSubmitting(true);
      let initialData = new FormData(e.currentTarget);
      let formData = new FormData();
      let publishTime = Date.now();

      formData.append("published", `${publishTime}`);

      let copy = (k: string) => {
        let x = initialData.get(k);
        if (x) {
          formData.append(k, x);
        }
      };

      copy("url");
      copy("body");
      copy("reply to");
      copy("category");
      copy("tags");

      let file: File;
      let embedsForSigning: Array<IEmbed & { bits: ArrayBuffer }> = [];

      for (file of form["embeds"]) {
        if (file.size > policy.maxSize) {
          alert("File too big");
          return;
        } else {
          await new Promise<string>((resolve) => {
            let reader = new FileReader();

            reader.onload = () => {
              let bytes = reader.result as ArrayBuffer;
              HashArrayBuffer(bytes).then((hashname) => {
                formData.append("embeds", file, hashname);
                resolve(hashname);

                embedsForSigning.push({
                  algorithm: policy.hash_algo,
                  hash: hashname,
                  mimetype: file.type,
                  size: `${file.size}`,
                  bits: bytes,
                });
              });
            };

            reader.readAsArrayBuffer(file);
          });
        }
      }

      let { hash, signature } = await new Promise<EntrySignature>((resolve) => {
        let skReader = new FileReader();

        skReader.onload = () => {
          let bits = skReader.result;
          openpgp
            .readPrivateKey({
              armoredKey: bits,
            })
            .then((sk) => {
              return sk.getPrimaryUser().then((author) => ({ author, sk }));
            })
            .then(({ author, sk }) => {
              // author.user.userID?.email;
              // author.user.userID?.name;

              const get = (attrib: string, def: string = "") =>
                formData.get(attrib)?.toString() || def;

              //! Make sure to diagnose this
              debugger;
              return SignEntry(bits, skPassword, {
                author: {
                  name: author.user.userID?.name || "anon",
                  publickey: sk.getKeyID().toHex(),
                },
                body: {
                  content: get("body"),
                  mimetype: "text/plain",
                },
                category: get("category", "all"),
                parenthash: get("reply to"),
                published: new Date(parseInt(get("published"))),
                embeds: embedsForSigning,
                tag: get("tags").split(","),
              }).then((sig) => {
                resolve(sig);
              });
            });
        };

        if (skFile) {
          skReader.readAsText(skFile);
        } else {
          throw new Error("Secret key needed");
        }
      });

      debugger;

      formData.append("signature", signature);
      formData.append("hash", hash);

      let resp = await fetch("/api/upload", {
        method: "post",
        body: formData,
      });

      setSubmitting(false);
      alert("Post complete");
      console.log(resp);
    }
  };

  const handle = (
    evt: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
          <tbody>
            <LabeledInput name="url" type="url" onChange={handle} />
            <LabeledRow name="body" label="body">
              <textarea name="body" cols={50} rows={4} onChange={handle} />
            </LabeledRow>
            <LabeledRow label="private key">
              <div className="flex">
                <input
                  type="file"
                  accept="application/pgp-keys"
                  required
                  onChange={(e) => setSkFile(e.target.files[0])}
                />
                <input
                  type="password"
                  required
                  placeholder="key password"
                  onChange={(e) => setSkPassword(e.target.value)}
                />
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
              label={`embed up to ${policy.maxEmbeds} files ${
                policy.maxSize ? `(${prettyBytes(policy.maxSize)} max)` : ""
              }`}
              name="embeds"
              type="file"
              accept={policy.embeds.join(",")}
              multiple={policy.maxEmbeds > 1}
              size={policy.maxSize}
              onChange={handle}
            />
          </tbody>
        </table>

        <input type="submit" disabled={submitting} />
      </form>
    </div>
  );
};

export default ThreadForm;
