import React, { InputHTMLAttributes, useState } from "react";

const PublicKeyInput: React.FC<
  InputHTMLAttributes<HTMLInputElement> & { label: string }
> = (props) => {
  return (
    <div className="flex flex-row">
      <label>{props.label}</label>
      <input {...props} />
    </div>
  );
};

const PublicKeySelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }
> = (props) => {
  return (
    <div>
      <label>{props.label}</label>
      <select {...props}>{props.children}</select>
    </div>
  );
};

const HashSelector: React.FC<{}> = (props) => {
  return (
    <PublicKeySelect label="Select Hash">
      <option>SHA-256</option>
      <option>SHA-384</option>
      <option>SHA-512</option>
    </PublicKeySelect>
  );
};

interface CryptoConfigProps {}

type CryptoConfigComponent = React.FC<CryptoConfigProps>;

const RSALine: CryptoConfigComponent = (props) => {
  return (
    <div>
      <PublicKeyInput label="Modulus Length" type="number" min="2048" />
      <PublicKeyInput label="Public Exponent" type="number" />
      <HashSelector />
    </div>
  );
};

const ECLine: CryptoConfigComponent = (props) => {
  return (
    <PublicKeySelect label="Named curve">
      <option>P-256</option>
      <option>P-384</option>
      <option>P-521</option>
    </PublicKeySelect>
  );
};

const HMCALine: CryptoConfigComponent = (props) => {
  return (
    <div>
      <HashSelector />
      <PublicKeyInput label="Length" type="number" min="0" />
    </div>
  );
};

const AESLine: CryptoConfigComponent = (props) => {
  return (
    <PublicKeySelect label="Select length">
      <option>128</option>
      <option>192</option>
      <option>256</option>
    </PublicKeySelect>
  );
};

interface PublicKeyRowProps {}

const PublicKeyRow: React.FC<PublicKeyRowProps> = (props) => {
  const [algorithm, setAlgorithm] = useState<string>("RSASSA-PKCS1-v1_5");

  return (
    <>
      <div className="modalOverlay">
        <div className="modalBox">
          <h3>Generate new keys</h3>
          <label>Select algorithm</label>
          <select onChange={(e) => setAlgorithm(e.target.value)}>
            <optgroup label="RSA">
              <option>RSASSA-PKCS1-v1_5</option>
              <option>RSA-PSS</option>
              <option>RSA-OAEP</option>
            </optgroup>
            <optgroup label="ECD">
              <option>ECDSA</option>
              <option>ECDH</option>
            </optgroup>
            <optgroup label="HMCA">
              <option>HMCA</option>
            </optgroup>
            <optgroup label="AES">
              <option>AES-CTR</option>
              <option>AES-CBC</option>
              <option>AES-GCM</option>
              <option>or AES-KW</option>
            </optgroup>
          </select>

          {(() => {
            switch (algorithm) {
              case "RSASSA-PKCS1-v1_5":
              case "RSA-PSS":
              case "RSA-OAEP":
                return <RSALine />;

              case "ECDSA":
              case "ECDH":
                return <ECLine />;

              case "HMCA":
                return <HMCALine />;

              case "AES-CTR":
              case "AES-CBC":
              case "AES-GCM":
              case "AES-KW":
                return <AESLine />;
            }
          })()}
        </div>
      </div>

      <tr>
        <td>
          <label>public key</label>
        </td>
        <td className="flex flex-row">
          <input
            type="text"
            list="publickeys"
            name="publickey"
            // onChange={handle}
          />
          <button>Generate new keys</button>
        </td>
      </tr>
    </>
  );
};

export default PublicKeyRow;
