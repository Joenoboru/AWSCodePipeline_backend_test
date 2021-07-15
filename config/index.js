const ENV = process.env.NODE_ENV || 'development';
const knex = require('knex');
const _ = require('underscore')
const env = {
  development: require('./development'),
  staging: require('./staging'),
  production: require('./production')
}

module.exports = _.extend({
  db: knex(env[ENV].dbConfig),
  jwtSecret: 'i*0D3Kb!PV',
  jwtExpireTime: 86400000,
  jwtExpireTimeForUser: 86400000*7,
  codeSecret: 'TTGBDlO8gf',
  userTokenSecret: '80e713f901',
  s3Upload: {
    region: 'ap-northeast-1',
    accessKeyId: 'AKIAWXTHDDOSANXHRVEI',
    secretAccessKey: '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'
  },
  awsSES:{
    accessKeyId: 'AKIASC6O3E433YRDQ6GP',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
  },
  sender: 'SUMMA<bonnytech.future@gmail.com>'
}, env[ENV])
