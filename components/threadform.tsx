import React, { useState, useEffect } from "react";
import _ from "lodash";
import prettyBytes from "pretty-bytes";
import * as openpgp from "openpgp";
import { Policy } from "../policy";
import { Category } from "../IPolicy";
import { LabeledInput, LabeledRow } from "./labeledinput";
import { HashArrayBuffer, SignThread } from "../crypto";
import { IEmbed, IThreadSimple } from "../schemas/Thread";
import { readFileAsArrayBuffer, readFileAsString } from "../readFile";

interface ThreadFormProps {
  replyTo?: string;
  category?: Category;
}

const ThreadForm: React.FC<ThreadFormProps> = (props) => {
  const [form, setForm] = useState<Record<string, any>>();
  const [submitting, setSubmitting] = useState(false);
  const [skFile, setSkFile] = useState<File>();
  const [skPassword, setSkPassword] = useState("");
  const [singleUse, setSingleUse] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form) {
      if (form["body"]?.length > Policy.maxLength) {
        alert("Body too long");
        return;
      }

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
                new Promise<IEmbed>(async (resolve) => {
                  let bits = await readFileAsArrayBuffer(file);
                  let hashname = await HashArrayBuffer(bits);

                  submissionForm.append("embeds", file, hashname);

                  resolve({
                    algorithm: Policy.hash_algo,
                    hash: hashname,
                    mimetype: file.type,
                    size: `${file.size}`,
                  });
                })
            )
        );
      } else {
        hashedEmbedsPromise = Promise.resolve([] as Array<IEmbed>);
      }

      let PrivateKeyReadPromise = await new Promise<{
        author: openpgp.PrimaryUser;
        sk: openpgp.PrivateKey;
      }>(async (resolve) => {
        if (skFile) {
          let bits = await readFileAsString(skFile);

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
        }
      });

      let [hashedEmbeds, { sk, author }] = await Promise.all([
        hashedEmbedsPromise,
        PrivateKeyReadPromise,
      ]);

      let authorName = author.user.userID?.name || "";
      let authorPublicKeyID = sk.toPublic().getKeyID().toHex();
      let useSKArmored = sk.armor();
      let useSKPassword = skPassword;

      if (singleUse) {
        const rand = () => Math.random().toString(36).substring(7);
        useSKPassword = rand();
        authorName = rand();
        let { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey(
          {
            type: "ecc",
            curve: "curve25519",
            userIDs: [{ name: authorName, email: rand() + "@c.ccc" }],
            passphrase: useSKPassword,
          }
        );
        useSKArmored = privateKeyArmored;

        let sig = await openpgp.sign({
          message: await openpgp.createMessage({ text: publicKeyArmored }),
          signingKeys: await openpgp.decryptKey({
            privateKey: sk,
            passphrase: skPassword,
          }),
          detached: true,
        });

        let tpk = await openpgp.readKey({
          armoredKey: publicKeyArmored,
        });
        authorPublicKeyID = tpk.getKeyID().toHex();

        const registerForm = new FormData();
        registerForm.append("signature", sig);
        registerForm.append("newkey", publicKeyArmored);

        let resp = await fetch("/api/regkey", {
          method: "post",
          body: registerForm,
        });

        if (!resp.ok) {
          alert("Unable to register temporary key");
          setSubmitting(false);
          return;
        }
      }

      let rawThread: Partial<IThreadSimple> = {
        embeds: hashedEmbeds,
        author: {
          name: authorName,
          publickey: authorPublicKeyID,
        },
        body: {
          content: form["body"],
          mimetype: "text/plain",
        },
        category: form["category"] || props.category?.name || "all",
        parenthash: form["reply to"],
        published: publishTime,
        url: form["url"],
      };

      let thread: IThreadSimple;

      try {
        ({ thread } = await SignThread(useSKArmored, useSKPassword, rawThread));
      } catch (e) {
        alert("Unable to decrypt private key with password");
        setSubmitting(false);
        return;
      }

      submissionForm.append("thread", JSON.stringify(thread));

      let resp = await fetch("/api/upload", {
        method: "post",
        body: submissionForm,
      });

      if (singleUse && useSKArmored) {
        let revokeForm = new FormData();
        let sk = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({
            armoredKey: useSKArmored,
          }),
          passphrase: useSKPassword,
        });

        let revSK = await sk.revoke({
          flag: openpgp.enums.reasonForRevocation.keyRetired,
          string: "One time use",
        });

        revokeForm.append("publickey", revSK.toPublic().armor());

        let resp = await fetch("/api/revoke", {
          method: "post",
          body: revokeForm,
        });

        if (!resp.ok) {
          alert("Unable to revoke temp key");
        }
      }

      setSubmitting(false);
      console.log(resp);

      if (resp.ok) {
        let hash = await resp.text();
        window.location.href = `/t/${hash}`;
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
            <LabeledRow
              name="body"
              label={`body (${
                Policy.maxLength - (form?.["body"]?.length || 0)
              } characters left)`}
            >
              <textarea
                name="body"
                rows={4}
                onChange={handle}
                className="w-full"
              />
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
              type="checkbox"
              label="use single-use key"
              checked={singleUse}
              onChange={(e) => setSingleUse(e.target.checked)}
            />
            <LabeledInput
              name="reply to"
              onChange={handle}
              defaultValue={props.replyTo || ""}
              disabled={props.replyTo ? true : false}
            />
            <LabeledRow label="category">
              <select
                onChange={handle}
                name="category"
                defaultValue={
                  props.category?.name || window.location.pathname.split("/")[1]
                }
                disabled={props.category ? true : false}
              >
                {Policy.categories.map((x, i) => (
                  <option key={i} value={x.name}>
                    {x.title}
                  </option>
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
