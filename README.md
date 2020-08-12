# superagent-toolkit

> [Superagent][superagent] plugin, providing frequently used tools, like reporting message of current request, directly retrieving specific property of response, etc.

[![Build Status](https://travis-ci.org/lakca/superagent-toolkit.svg?branch=master)](https://travis-ci.org/lakca/superagent-toolkit)
[![codecov](https://codecov.io/gh/lakca/superagent-toolkit/branch/master/graph/badge.svg)](https://codecov.io/gh/lakca/superagent-toolkit)

## Usage

### Agent
```js
const superagent = require('superagent')
const toolkit = require('@lakca/superagent-toolkit')

const agent = new superagent.Agent()

agent.use(toolkit(options))

agent
  .get('/test')
  .configure('...', '...') // change config
```

### General
```js
const superagent = require('superagent')
const toolkit = require('@lakca/superagent-toolkit')

superagent
  .get('/test')
  .use(toolkit(options))
```

## Options

### `options.configure` {function}

Set configure function, which can be called to change `config` later.

### `options.report` {(error: Error, message: string, response: superagent.Response): void}

Function to receive message of request.

**Note**: it will benefit from using this function for global notification of request status.

### `options.clientError` {true|string|string[]|function}

Dealing with `4xx` except `401` http code. If value is:

- `true`, report message retrieved using `config.messageProperty`;
- `string`, report message using the string instead;
- `string[]`, report message using ths first not nullable(`!= null`) property retrieving via the array element one by one, such as `['body.message', 'header.statusMessage']`;
- `function`, report message using returned value if which is not void.

### `options.serverError` {true|string|string[]|function}

Dealing with `5xx` http code. Similar as `config.clientError`.

### `options.unauthorized` {true|string|string[]|function}

Dealing with `401` http code. If value is:

- `true`, reload current window;
- `string`, redirect using the string;
- `string[]`, redirect using ths first not nullable(`!= null`) property retrieving via the array element one by one, such as `['body.location']`;
- `function`, redirect using returned value if which is not void, **so you can provide your own redirection in the function without returning value.**

### `options.messageProperty` {string=res.statusMessage}

Report message property.

when http code is `2xx`, using this to retrieve message.

also, this is the default message property for `true` value of `config.clientError` and `config.serverError`.

**Note**: support descendant property, such as `body.message`

### `options.returnProperty` {string}

Response property expected to be returned instead of the whole response object.

**Note**: support descendant property, such as `body.data`

### `options.swallowError` {boolean=false}

Silence error, no request/response error will be thrown since [superagent][superagent] does that by default.

**Note**: this is useful when we handle request status by general handler `config.report`, then focusing on handling business data in dealing with your business logic.

### `options.debug` {boolean=false}

log to console.

### `options.prefix` {string}

### `options.suffix` {string}

### `options.jsonp` {object}

Read more in [superagent-jsonp][jsonp]

### `options.jsonp.callbackParam` {string=callback}

### `options.jsonp.callbackName` {string}

### `options.jsonp.timeout` {number=1000}

## LICENSE

MIT

[superagent]: https://github.com/visionmedia/superagent
[jsonp]: https://github.com/lamp/superagent-jsonp
