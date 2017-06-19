export default Base => class extends Base {
  /**
   * List objects in this bucket
   */
  getBucket() {
    const headers = {
      Date: this._buildDateHeader(),
    };

    const authHeader = this._buildAuthHeader('GET', '', {}, headers);
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    };

    return new Promise((resolve, reject) => {
      fetch(this.bucketBaseUrl, fetchOptions)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};
