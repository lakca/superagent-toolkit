const assert = require('assert')
const sp = require('superagent')
const tool = require('./index')

const userAgent = '5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'

const followers = sp.agent()
  .set('user-agent', userAgent)
  .use(tool({
    debug: true,
    prefix: 'http://api.github.com/users/',
    suffix: '/followers',
    clientError: true,
    serverError: true,
    messageProperty: 'status',
    unauthorized: true,
    swallowError: false,
    returnProperty: 'body',
    configure: 'config',
    jsonp: null,
    report(err, msg, res) {
      if (res) {
        assert.ok(msg === undefined || typeof msg === 'number', 'report message should be a number or undefined, since `messageProperty` is status')
      } else {
        assert.ok(typeof msg === 'string')
      }
      assert.ok(err === null || err instanceof Error)
      assert.ok(res === null || res instanceof sp.Response)
    }
  }))

followers.get('lakca').config('swallowError', true).end(function(err, res) {
  assert.ok(err === null, 'err should be always null, since `swallowError` is true.')
  assert.ok(!res || Array.isArray(res), 'res should be an array, since `returnProperty` is body.')
})
