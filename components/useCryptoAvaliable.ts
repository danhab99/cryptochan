import { useState, useEffect } from "react";

export default function useCryptoAvaliable() {
  const [avaliable, setAvaliable] = useState(true);

  useEffect(() => {
    if (!(window && window.crypto && window.crypto.subtle)) {
      setAvaliable(false);
    }
  }, []);

  return avaliable;
}
