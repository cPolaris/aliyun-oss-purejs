import BaseClient from './BaseClient';
import bucketMixin from './bucketMixin';
import objectMixin from './objectMixin';

export default class OSS extends objectMixin(bucketMixin(BaseClient)) { }
