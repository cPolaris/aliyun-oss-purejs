import HmacSha1Base64 from './crypto/HmacSha1Base64';
import Base64 from './crypto/base64';

export default Base => class extends Base {
  /**
   * We post multipart/form-data instead of put
   * objectPath + objectName = object key
   * https://help.aliyun.com/document_detail/31988.html
   * @param {string} objectPath OSS path e.g. /user/testPath
   * @param {string} objectName OSS name for this object e.g. test.txt
   * @param {string} fileUri iOS/Android file system URI
   * @private
   */
  postObject(objectPath, objectName, fileUri) {
    // react-native FormData
    // https://github.com/facebook/react-native/blob/master/Libraries/Network/FormData.js
    const formData = new FormData();

    const uploadFile = {
      uri: fileUri,
      name: objectName, // controls filename in content-disposition
    };

    const postPolicy = {
      expiration: new Date(Date.now() + 60000).toISOString(), // post must happen within 1 minute
      conditions: [
        { bucket: this.bucketName },
      ],
    };

    const encodedPolicy = Base64.encode(JSON.stringify(postPolicy));
    const signature = HmacSha1Base64(encodedPolicy, this.accessKeySecret);

    formData.append('key', `${objectPath}/${objectName}`);
    formData.append('OSSAccessKeyId', this.accessKeyId);
    formData.append('policy', encodedPolicy);
    formData.append('signature', signature);
    formData.append('x-oss-security-token', this.securityToken);
    formData.append('file', uploadFile);

    const fetchOptions = {
      method: 'POST',
      headers: {

      },
      body: formData,
    };

    return new Promise((resolve, reject) => {
      fetch(this.bucketBaseUrl, fetchOptions)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};
