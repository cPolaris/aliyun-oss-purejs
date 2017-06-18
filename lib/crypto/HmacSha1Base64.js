import Base64 from './base64';
import Crypto from './crypto';

export default (message, secret) => {
  const bytes = Crypto.HMAC(Crypto.SHA1, message, secret, { asBytes: true });
  return Crypto.util.bytesToBase64(bytes);
};
