import assert from 'assert';
import { describe, it } from 'mocha';
import OSS from '../lib/OSS';

// these credentials are from the official documentation for demonstration purposes
const TEST_CONFIG = {
  accessKeyId: '44CF9590006BF252F707',
  accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV',
  securityToken: 'nil',
  endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  bucketName: 'oss-example',
};

describe('BaseClient', () => {
  const testClient = new OSS(TEST_CONFIG);

  describe('#constructor', () => {
    it('preserves configs', () => {
      assert.strictEqual(testClient.accessKeyId, TEST_CONFIG.accessKeyId);
      assert.strictEqual(testClient.accessKeySecret, TEST_CONFIG.accessKeySecret);
      assert.strictEqual(testClient.securityToken, TEST_CONFIG.securityToken);
      assert.strictEqual(testClient.endpoint, TEST_CONFIG.endpoint);
      assert.strictEqual(testClient.bucketName, TEST_CONFIG.bucketName);
    });
    it('has correct bucket URL', () => {
      assert.strictEqual(testClient.bucketBaseUrl, `http://${TEST_CONFIG.bucketName}.${TEST_CONFIG.endpoint}`);
    });
  });

  // Example from https://help.aliyun.com/document_detail/31951.html
  describe('#_buildAuthHeader', () => {
    const reqParams = {};

    const reqHeaders = {
      Date: 'Thu, 17 Nov 2005 18:49:58 GMT',
      'Content-MD5': 'ODBGOERFMDMzQTczRUY3NUE3NzA5QzdFNUYzMDQxNEM=',
      'Content-Type': 'text/html',
      'X-OSS-Meta-Author': 'foo@bar.com',
      'X-OSS-Magic': 'abracadabra',
    };

    const result = testClient._buildAuthHeader('PUT', '/nelson', reqParams, reqHeaders);

    it('has correct sign string', () => {
      assert.strictEqual(result.signStr, 'PUT\nODBGOERFMDMzQTczRUY3NUE3NzA5QzdFNUYzMDQxNEM=\ntext/html\nThu, 17 Nov 2005 18:49:58 GMT\nx-oss-magic:abracadabra\nx-oss-meta-author:foo@bar.com\n/oss-example/nelson');
    });

    it('has correct canon resource', () => {
      assert.strictEqual(result.canonResource, '/oss-example/nelson');
    });

    it('has correct authorization header', () => {
      assert.strictEqual(result.authHeader, 'OSS 44CF9590006BF252F707:26NBxoKdsyly4EDv6inkoDft/yA=');
    });
  });
});
