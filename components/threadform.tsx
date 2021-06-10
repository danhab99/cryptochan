import React, { useState, useEffect } from "react";
import _ from "lodash";
import prettyBytes from "pretty-bytes";
import * as openpgp from "openpgp";
import { Policy, Category } from "../policy";
import { LabeledInput, LabeledRow } from "./labeledinput";
import { HashArrayBuffer, SignThread } from "../crypto";
import { IEmbed, IThreadSimple } from "../schemas/Thread";

interface ThreadFormProps {
  replyTo?: string;
  category?: Category;
}

const ThreadForm: React.FC<ThreadFormProps> = (props) => {
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

      console.log("Form", form);

      let hashedEmbedsPromise: Promise<Array<IEmbed>>;

      if (form["embeds"] && form["embeds"].length > 0) {
        hashedEmbedsPromise = Promise.all(
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
      } else {
        hashedEmbedsPromise = Promise.resolve([] as Array<IEmbed>);
      }

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
        body: {
          content: form["body"],
          mimetype: "text/plain",
        },
        category: form["category"],
        parenthash: form["reply to"],
        published: publishTime,
        url: form["url"],
      };

      let hash: string, signature: string;

      try {
        ({ hash, signature } = await SignThread(
          sk.armor(),
          skPassword,
          rawThread
        ));
      } catch (e) {
        alert("Unable to decrypt private key with password");
        setSubmitting(false);
        return;
      }

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

      if (resp.redirected) {
        if (resp.url) {
          window.location.href = resp.url;
        }
      }
    }
  };

  const handle = (
    evt: React.ChangeEvent<
      HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [evt.target.name]: evt.target.files || evt.target.value,
    }));
  };

  useEffect(() => {
    setForm({
      "reply to": props.replyTo,
      category: props.category?.name,
    });
  }, [props.replyTo, props.category]);

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
                  onChange={(e) => setSkFile(e?.target?.files?.[0])}
                />
                <input
                  type="password"
                  required
                  placeholder="key password"
                  onChange={(e) => setSkPassword(e.target.value)}
                />
              </div>
            </LabeledRow>
            <LabeledInput
              name="reply to"
              onChange={handle}
              defaultValue={props.replyTo || ""}
            />
            <LabeledRow label="category">
              <select
                onChange={handle}
                name="category"
                defaultValue={
                  props.category?.name || window.location.pathname.split("/")[1]
                }
              >
                {Policy.categories.map((x) => (
                  <option value={x.name}>{x.title}</option>
                ))}
              </select>
            </LabeledRow>
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
