import React, { useState } from "react";
import _ from "lodash";
import prettyBytes from "pretty-bytes";
import * as openpgp from "openpgp";
import { Policy } from "../policy";
import { LabeledInput, LabeledRow } from "./labeledinput";
import { ThreadSignature, HashArrayBuffer, SignThread } from "../crypto";
import { IEmbed, IThread, IThreadSimple } from "../schemas/Thread";

interface ThreadFormProps {}

const ThreadForm: React.FC<ThreadFormProps> = () => {
  const [form, setForm] = useState<Record<string, any>>();
  const [submitting, setSubmitting] = useState(false);
  const [skFile, setSkFile] = useState<File>();
  const [skPassword, setSkPassword] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form) {
      setSubmitting(true);
      let submissionForm = new FormData();
      let publishTime = new Date();

      // TODO: So what we're gonna do is hash all the embeds, then include them in a datastruct in the shape of IThread, then stringify it using the stable stringifier you'll find in the deps list, then hash that datastruct, then sign that hash. Should be good enough.

      console.log("Form", form);
      debugger;

      let hashedEmbedsPromise: Promise<Array<IEmbed>> = Promise.all(
        ([...form["embeds"]] as Array<File>)
          .filter((file) => file.size < Policy.maxSize)
          .map(
            (file) =>
              new Promise<IEmbed>((resolve) => {
                let reader = new FileReader();

                reader.onload = () => {
                  let bytes = reader.result as ArrayBuffer;
                  HashArrayBuffer(bytes).then((hashname) => {
                    submissionForm.append("embeds", file, hashname);

                    resolve({
                      algorithm: Policy.hash_algo,
                      hash: hashname,
                      mimetype: file.type,
                      size: `${file.size}`,
                    });
                  });
                };

                reader.readAsArrayBuffer(file);
              })
          )
      );

      debugger;

      let PrivateKeyReadPromise = await new Promise<{
        author: openpgp.PrimaryUser;
        sk: openpgp.PrivateKey;
      }>((resolve) => {
        let skReader = new FileReader();

        skReader.onload = () => {
          let bits = skReader.result?.toString();
          if (bits) {
            openpgp
              .readPrivateKey({
                armoredKey: bits,
              })
              .then((sk) => {
                return sk.getPrimaryUser().then((author) => {
                  resolve({ author, sk });
                });
              });
          }
        };

        if (skFile) {
          skReader.readAsText(skFile);
        } else {
          throw new Error("Secret key needed");
        }
      });

      let [hashedEmbeds, { sk, author }] = await Promise.all([
        hashedEmbedsPromise,
        PrivateKeyReadPromise,
      ]);

      let rawThread: Partial<IThreadSimple> = {
        embeds: hashedEmbeds,
        author: {
          name: author.user.userID?.name || "",
          publickey: (await sk.getSigningKey()).getKeyID().toHex(),
        },
        body: form["body"],
        category: form["category"] || "all",
        parenthash: form["reply to"],
        published: publishTime,
        tag: form["tags"],
      };

      debugger;

      let { hash, signature } = await SignThread(
        sk.armor(),
        skPassword,
        rawThread
      );

      debugger;

      rawThread["hash"] = {
        algorithm: Policy.hash_algo,
        value: hash,
      };

      rawThread["signature"] = signature;

      submissionForm.append("thread", JSON.stringify(rawThread));

      let resp = await fetch("/api/upload", {
        method: "post",
        body: submissionForm,
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
                {Policy.categories.map((x) => (
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
              label={`embed up to ${Policy.maxEmbeds} files ${
                Policy.maxSize ? `(${prettyBytes(Policy.maxSize)} max)` : ""
              }`}
              name="embeds"
              type="file"
              accept={Policy.embeds.join(",")}
              multiple={Policy.maxEmbeds > 1}
              size={Policy.maxSize}
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
