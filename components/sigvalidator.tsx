import React, { useState, useEffect } from "react";
import { VerifyThread } from "../crypto";
import { IThreadSimple } from "../schemas/Thread";

enum ValidatorState {
  WORKING,
  VALID,
  INVALID,
  ERROR,
}

interface SigValidatorProps {
  thread: IThreadSimple;
}

const SigValidator: React.FC<SigValidatorProps> = (props) => {
  const [state, setState] = useState<ValidatorState>(ValidatorState.WORKING);

  useEffect(() => {
    setState(ValidatorState.WORKING);

    (async () => {
      let resp = await fetch(`/api/pk/${props.thread.author.publickey}`);

      if (resp.ok) {
        let pk = await resp.text();
        try {
          if (await VerifyThread(pk, props.thread.signature, props.thread)) {
            setState(ValidatorState.VALID);
          } else {
            setState(ValidatorState.INVALID);
          }
        } catch (e) {
          setState(ValidatorState.INVALID);
          console.error(e);
        }
      } else {
        setState(ValidatorState.ERROR);
      }
    })();
  }, [props.thread]);

  return (
    <a
      href={`https://cirw.in/gpg-decoder/#${encodeURI(props.thread.signature)}`}
      target="_blank"
      className="no-underline"
    >
      {" "}
      {(() => {
        switch (state) {
          case ValidatorState.INVALID:
            return (
              <span className="text-invalid-500 sigValidator">[INVALID]</span>
            );

          case ValidatorState.VALID:
            return <span className="text-valid-500 sigValidator">[VALID]</span>;

          case ValidatorState.WORKING:
            return (
              <span className="text-validating-500 sigValidator">
                [WORKING...]
              </span>
            );

          case ValidatorState.ERROR:
            return (
              <span className="text-invalid-500 sigValidator">[ERROR]</span>
            );
        }
      })()}
    </a>
  );
};

export default SigValidator;
