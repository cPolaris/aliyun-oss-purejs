import HmacSha1Base64 from './crypto/HmacSha1Base64';

// x-oss-security-token：SecurityToken

export default class BaseClient {
  /**
   * Use STS credentials to construct a temporary client
   * @param {string} config.accessKeyId
   * @param {string} config.accessKeySecret
   * @param {string} config.securityToken
   * @param {string} config.endpoint e.g. 'oss-cn-beijing.aliyuncs.com'
   * @param {string} config.bucketName
   */
  constructor(config) {
    this.accessKeyId = config.accessKeyId;
    this.accessKeySecret = config.accessKeySecret;
    this.securityToken = config.securityToken;
    this.endpoint = config.endpoint;
    this.bucketName = config.bucketName;
    this.bucketBaseUrl = `https://${config.bucketName}.${config.endpoint}`;
  }

  _get() {

  }

  /**
   * 1. construct authentication header
   * 2. canonicalize resource name
   */
  _buildAuthHeader(verb, resource, reqParams, headers) {
    // canonicalize OSS headers
    const ossHeaders = {};

    Object.keys(headers).forEach((key) => {
      const canonKey = key.toLowerCase();
      if (canonKey.startsWith('x-oss-')) {
        ossHeaders[canonKey] = headers[key];
      }
    });

    const ossHeaderList = [];

    Object.keys(ossHeaders).sort().forEach((key) => {
      ossHeaderList.push(`${key}:${ossHeaders[key]}`);
    });

    // canonicalize SubResource and QueryString
    const queryList = [];

    Object.keys(reqParams).sort().forEach((key) => {
      if (reqParams[key]) {
        queryList.push(`${key}=${reqParams[key]}`);
      } else {
        queryList.push(`${key}`);
      }
    });

    let canonResource = `/${this.bucketName}${resource}`;

    if (queryList.length > 0) {
      canonResource = `${canonResource}?${queryList.join('&')}`;
    }

    // put everything together
    const allParams = [verb.toUpperCase()];

    if (headers['Content-MD5']) {
      allParams.push(headers['Content-MD5']);
    }

    if (headers['Content-Type']) {
      allParams.push(headers['Content-Type']);
    }

    if (headers.Date) {
      allParams.push(headers.Date);
    } else {
      allParams.push(new Date().toUTCString());
    }

    if (ossHeaderList.length > 0) {
      allParams.push(ossHeaderList.join('\n'));
    }

    allParams.push(canonResource);

    const signStr = allParams.join('\n');

    const signature = HmacSha1Base64(allParams.join('\n'), this.accessKeySecret);

    return {
      authHeader: `OSS ${this.accessKeyId}:${signature}`,
      canonResource,
      signStr,
    };
  }
}
