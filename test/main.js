const { origin } = require('./support/server')
const superagent = require('superagent')
const toolkit = require('../index')
const should = require('should')

function mockWindow() {
  global.window = {
    location: {
      _reloaded: false,
      href: '',
      reload() {
        this._reloaded = true
      }
    }
  }
}

function mockConsole() {
  global.console = {
    log(v) {
      this._log = v
    },
    error(v) {
      this._error = v
    }
  }
}

describe('main', function() {

  describe('default', function() {
    const agent = superagent.agent().use(toolkit())

    it('default: ok', done => {
      agent.get(origin + '/status/200')
        .end((err, res) => {
          should(err).null()
          should(res.ok).true()
          done()
        })
    })

    it('default: client error', done => {
      agent.get(origin + '/status/400')
        .end((err, res) => {
          should(err).instanceof(Error)
          should(res.clientError).true()
          done()
        })
    })

    it('default: server error', done => {
      agent.get(origin + '/status/500')
        .end((err, res) => {
          should(err).instanceof(Error)
          should(res.serverError).true()
          done()
        })
    })

    it('default: destroy connection', done => {
      agent.get(origin + '/status/close')
        .end((err, res) => {
          err.should.instanceof(Error)
          should(res).undefined()
          done()
        })
    })
  })

  describe('opt', () => {
    const agent = superagent.agent().use(toolkit({
      configure: 'cfg',
      clientError: ['body.message'],
      serverError: 'Sorry, please try later!',
      unauthorized: '/login',
      returnProperty: 'body.data',
      swallowError: true,
      prefix: origin,
      suffix: '/' + escape('this is a message.'),
      debug: false,
      report(err, msg, res) {
        should(msg).eql(res.res.statusMessage)
      }
    }))

    it('2xx', done => {
      agent.get('/status/200')
        .end((err, res) => {
          should(err).be.null()
          should(res).eql({ greet: 'Hello World!' })
          done()
        })
    })

    it('3xx', done => {
      agent.get('/status/301')
        .redirects(0)
        .cfg('returnProperty', false)
        .end((err, res) => {
          should(err).be.null()
          should(res.headers.location).eql('/redirect')
          done()
        })
    })

    it('clientError (4xx)', done => {
      agent.get('/status/400')
        .cfg('report', (err, msg, res) => {
          should(msg).eql(res.body.message)
          should(res.clientError).be.true()
        })
        .end((err, res) => {
          should(err).be.null()
          done()
        })
    })

    it('serverError (5xx)', done => {
      agent.get('/status/500')
        .cfg('serverError', 'Sorry!')
        .cfg('report', (err, msg, res) => {
          should(msg).eql('Sorry!')
          should(res.serverError).be.true()
        })
        .end((err, res) => {
          should(err).be.null()
          done()
        })
    })

    it('serverError (5xx)', done => {
      agent.get('/status/503')
        .cfg('serverError', res => 'Oh, Sorry!')
        .cfg('report', (err, msg, res) => {
          should(msg).eql('Oh, Sorry!')
          should(res.serverError).be.true()
        })
        .end((err, res) => {
          should(err).be.null()
          done()
        })
    })

    it('error without response', done => {
      agent.get('')
        .cfg('report', (err, msg) => should(msg).eql(err.message))
        .abort()
        .end((err, res) => {
          should(err).be.null()
          should(res).be.undefined()
          done()
        })
    })

    it('jsonp', done => {
      mockWindow()
      const r = agent.get('/status/200')
        .cfg('jsonp', { callbackName: 'expectedCallbackName' })
      should(() => r.end()).be.throw(/document/)
      should(r._jsonp).property('callbackName', 'expectedCallbackName')
      done()
    })

    describe('unauthorized', () => {

      beforeEach(mockWindow)

      it('string', done => {
        agent.get('/status/401')
          .end((err, res) => {
            should(err).be.null()
            should(window.location.href).eql('/login')
            done()
          })
      })
      it('true', done => {
        agent.get('/status/401')
          .cfg('unauthorized', true)
          .end((err, res) => {
            should(err).be.null()
            should(window.location._reloaded).be.true()
            done()
          })
      })
      it('properties', done => {
        agent.get('/status/401')
          .cfg('unauthorized', ['a.b', 'c.d.e'])
          .end((err, res) => {
            should(err).be.null()
            should(window.location.href).be.undefined()
            done()
          })
      })
      it('function', done => {
        agent.get('/status/401')
          .cfg('unauthorized', res => '/sign')
          .end((err, res) => {
            should(err).be.null()
            should(window.location.href).eql('/sign')
            done()
          })
      })
    })
  })

  it('conflict configure method', done => {
    should(() => superagent.get('/').use(toolkit({ configure: 'set' }))).be.throw()
    done()
  })

  after(() => {
    describe('debug', () => {
      mockConsole()
      it('debug', done => {
        superagent.get('/')
          .use(toolkit({ debug: true }))
          .end(() => done())
        should(console._log).property('debug', true)
      })
    })
  })
})
