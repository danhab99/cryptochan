import React, { useState, useEffect } from "react";
import { VerifyThread } from "../crypto";
import { IThread } from "../schemas/Thread";

enum ValidatorState {
  WORKING,
  VALID,
  INVALID,
  ERROR,
}

interface SigValidatorProps {
  thread: IThread;
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

  switch (state) {
    case ValidatorState.INVALID:
      return <span className="text-invalid-500 font-mono">[INVALID]</span>;

    case ValidatorState.VALID:
      return <span className="text-valid-600 font-mono">[VALID]</span>;

    case ValidatorState.WORKING:
      return (
        <span className="text-validating-500 font-mono">[WORKING...]</span>
      );

    case ValidatorState.ERROR:
      return <span className="text-invalid-600 font-mono">[ERROR...]</span>;
  }
};

export default SigValidator;
