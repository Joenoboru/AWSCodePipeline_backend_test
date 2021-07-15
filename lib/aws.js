const config = require('../config');
const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: config.awsSES.accessKeyId,
  secretAccessKey: config.awsSES.secretAccessKey,
  region: config.awsSES.region
});

module.exports = aws;
  