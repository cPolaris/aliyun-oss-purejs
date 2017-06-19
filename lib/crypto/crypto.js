/*!
 * Crypto-JS v1.1.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 *
 * (c) 2009-2013 by Jeff Mott. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions, and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions, and the following disclaimer in the documentation or other
 * materials provided with the distribution.
 * Neither the name CryptoJS nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS,"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const Crypto = {};

const base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Crypto utilities
const util = {

  // Bit-wise rotate left
  rotl(n, b) {
    return (n << b) | (n >>> (32 - b));
  },

  // Bit-wise rotate right
  rotr(n, b) {
    return (n << (32 - b)) | (n >>> b);
  },

  // Swap big-endian to little-endian and vice versa
  endian(n) {
    // If number given, swap endian
    if (n.constructor == Number) {
      return util.rotl(n, 8) & 0x00FF00FF |
        util.rotl(n, 24) & 0xFF00FF00;
    }

    // Else, assume array and swap all items
    for (let i = 0; i < n.length; i++) {
      n[i] = util.endian(n[i]);
    }
    return n;
  },

  // Generate an array of any length of random bytes
  randomBytes(n) {
    for (var bytes = []; n > 0; n--) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes;
  },

  // Convert a string to a byte array
  stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  },

  // Convert a byte array to a string
  bytesToString(bytes) {
    const str = [];
    for (let i = 0; i < bytes.length; i++) {
      str.push(String.fromCharCode(bytes[i]));
    }
    return str.join('');
  },

  // Convert a string to big-endian 32-bit words
  stringToWords(str) {
    const words = [];
    for (let c = 0, b = 0; c < str.length; c++, b += 8) {
      words[b >>> 5] |= str.charCodeAt(c) << (24 - b % 32);
    }
    return words;
  },

  // Convert a byte array to big-endian 32-bits words
  bytesToWords(bytes) {
    const words = [];
    for (let i = 0, b = 0; i < bytes.length; i++, b += 8) {
      words[b >>> 5] |= bytes[i] << (24 - b % 32);
    }
    return words;
  },

  // Convert big-endian 32-bit words to a byte array
  wordsToBytes(words) {
    const bytes = [];
    for (let b = 0; b < words.length * 32; b += 8) {
      bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
    }
    return bytes;
  },

  // Convert a byte array to a hex string
  bytesToHex(bytes) {
    const hex = [];
    for (let i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join('');
  },

  // Convert a hex string to a byte array
  hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  },

  // Convert a byte array to a base-64 string
  bytesToBase64(bytes) {
    // Use browser-native function if it exists
    if (typeof btoa === 'function') return btoa(util.bytesToString(bytes));

    let base64 = [],
      overflow;

    for (let i = 0; i < bytes.length; i++) {
      switch (i % 3) {
        case 0:
          base64.push(base64map.charAt(bytes[i] >>> 2));
          overflow = (bytes[i] & 0x3) << 4;
          break;
        case 1:
          base64.push(base64map.charAt(overflow | (bytes[i] >>> 4)));
          overflow = (bytes[i] & 0xF) << 2;
          break;
        case 2:
          base64.push(base64map.charAt(overflow | (bytes[i] >>> 6)));
          base64.push(base64map.charAt(bytes[i] & 0x3F));
          overflow = -1;
      }
    }

    // Encode overflow bits, if there are any
    if (overflow != undefined && overflow != -1) {
      base64.push(base64map.charAt(overflow));
    }

    // Add padding
    while (base64.length % 4 != 0) base64.push('=');

    return base64.join('');
  },

  // Convert a base-64 string to a byte array
  base64ToBytes(base64) {
    // Use browser-native function if it exists
    if (typeof atob === 'function') return util.stringToBytes(atob(base64));

    // Remove non-base-64 characters
    base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

    const bytes = [];

    for (let i = 0; i < base64.length; i++) {
      switch (i % 4) {
        case 1:
          bytes.push((base64map.indexOf(base64.charAt(i - 1)) << 2) |
            (base64map.indexOf(base64.charAt(i)) >>> 4));
          break;
        case 2:
          bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & 0xF) << 4) |
            (base64map.indexOf(base64.charAt(i)) >>> 2));
          break;
        case 3:
          bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & 0x3) << 6) |
            (base64map.indexOf(base64.charAt(i))));
          break;
      }
    }

    return bytes;
  },

};

Crypto.util = util;

// Crypto mode namespace
Crypto.mode = {};

/** ***************************************************************************
 * SHA1
 ****************************************************************************/

// Public API
const SHA1 = function (message, options) {
  const digestbytes = util.wordsToBytes(SHA1._sha1(message));
  return options && options.asBytes ? digestbytes :
    options && options.asString ? util.bytesToString(digestbytes) :
      util.bytesToHex(digestbytes);
};

Crypto.SHA1 = SHA1;

// The core
SHA1._sha1 = function (message) {
  let m = util.stringToWords(message),
    l = message.length * 8,
    w = [],
    H0 = 1732584193,
    H1 = -271733879,
    H2 = -1732584194,
    H3 = 271733878,
    H4 = -1009589776;

  // Padding
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >>> 9) << 4) + 15] = l;

  for (let i = 0; i < m.length; i += 16) {
    let a = H0,
      b = H1,
      c = H2,
      d = H3,
      e = H4;

    for (let j = 0; j < 80; j++) {
      if (j < 16) w[j] = m[i + j];
      else {
        const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
        w[j] = (n << 1) | (n >>> 31);
      }

      const t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
        j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
          j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
            j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
              (H1 ^ H2 ^ H3) - 899497514);

      H4 = H3;
      H3 = H2;
      H2 = (H1 << 30) | (H1 >>> 2);
      H1 = H0;
      H0 = t;
    }

    H0 += a;
    H1 += b;
    H2 += c;
    H3 += d;
    H4 += e;
  }

  return [H0, H1, H2, H3, H4];
};

// Package private blocksize
SHA1._blocksize = 16;

/** ***************************************************************************
 * HMAC
 ****************************************************************************/

Crypto.HMAC = function (hasher, message, key, options) {
  // Allow arbitrary length keys
  key = key.length > hasher._blocksize * 4 ?
    hasher(key, { asBytes: true }) :
    util.stringToBytes(key);

  // XOR keys with pad constants
  let okey = key,
    ikey = key.slice(0);
  for (let i = 0; i < hasher._blocksize * 4; i++) {
    okey[i] ^= 0x5C;
    ikey[i] ^= 0x36;
  }

  const hmacbytes = hasher(util.bytesToString(okey) +
    hasher(util.bytesToString(ikey) + message, { asString: true }),
  { asBytes: true });
  return options && options.asBytes ? hmacbytes :
    options && options.asString ? util.bytesToString(hmacbytes) :
      util.bytesToHex(hmacbytes);
};

export default Crypto;
