export const readFileAsString = (f: File): Promise<string> => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as string) || "");
    };
    reader.readAsText(f);
  });
};

export const readFileAsArrayBuffer = (f: File): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as ArrayBuffer) || "");
    };
    reader.readAsArrayBuffer(f);
  });
};
