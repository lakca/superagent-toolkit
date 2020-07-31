const jsonp = require('superagent-jsonp')

/**
 * see superagent source code
 * @callback callback
 * @param {Error} error
 * @param {Response} response
 * @api private
 */
/**
 * see superagent source code
 * @callback _shouldRetry
 * @param {Error} error
 * @param {Response} response
 * @return {boolean}
 * @api private
 */
/**
 * @callback report
 * @param {Error|null} error
 * @param {string|undefined} message reporting message
 * @param {Response} response
 * @return {void}
 */
/**
 * @typedef {import('superagent').SuperAgentRequest & { callback: callback, _shouldRetry: _shouldRetry}} SuperAgentRequest
 * @typedef {import('superagent').Response} Response
 * @typedef {string[]} SubProps using ths first not nullable(`!= null`) property retrieving via the elements one by one, supporting descendant property, such as `body.message`.
 */

/**
 * @typedef config
 *
 *
 * @property {string} [configure=configure] Set configure function, which can be called to change `config` later.
 *
 *
 * @property {boolean|string|SubProps|((response: Response) => string)} [clientError] dealing with http code is `4xx`: report.
 *
 * if value is:
 * - `true`, report message retrieved using `config.messageProperty`;
 * - `string`, report message using the string instead;
 * - `string[]`, report message using ths first not nullable(`!= null`) property retrieving via the array element one by one, such as ['body.message', 'header.statusMessage'];
 * - `function`, report message using returned value if which is not void.
 *
 *
 * @property {boolean|string|SubProps|((response: Response) => string)} [serverError] dealing with http code is `5xx`: report.
 *
 * if value is:
 * - `true`, report message retrieved using `config.messageProperty`;
 * - `string`, report message using the string instead;
 * - `string[]`, report message using ths first not nullable(`!= null`) property retrieving via the array element one by one, such as ['body.message', 'header.statusMessage'];
 * - `function`, report message using returned value if which is not void.
 *
 *
 * @property {boolean|string|SubProps|((response: Response) => string)} [unauthorized] dealing with http code is `401`: redirection.
 *
 * If value is:
 * - `true`, reload current window;
 * - `string`, redirect using the string;
 * - `string[]`, redirect using ths first not nullable(`!= null`) property retrieving via the array element one by one, such as ['body.location'];
 * - `function`, redirect using returned value if which is not void.
 *
 *
 * @property {string} [messageProperty] property name of response state message.
 *
 * **Note**: support descendant property, such as `body.message`
 *
 *
 * @property {report} [report] report message.
 *
 * **Note**: it will benefit from using this function for global notification.
 *
 *
 * @property {string} [returnProperty] response property expected to be returned instead of the whole response object.
 *
 * **Note**: support descendant property, such as `body.data`
 *
 *
 * @property {boolean} [swallowError] silence error.
 * no request/response error will be thrown since `superagent` does that by default.
 *
 *
 * @property {object} [jsonp] jsonp request, read more in `superagent-jsonp`
 * @property {string} [jsonp.callbackParam=callback] callback name in request query.
 * @property {string} [jsonp.callbackName] callback name returned should be.
 * @property {number} [jsonp.timeout=1000] millisecond.
 *
 *
 * @property {boolean} [debug] log to console.
 */

/**
 * @param {config} config
 */
module.exports = function(config) {
  return plugin
  /**
   * Get sub property of object.
   *
   * @private
   *
   * @author lakca<912910011@qq.com>
   * @param {boolean} debug enable log (console)
   * @param {{[prop: string]: *,[prop: number]: *}} obj object which property is retrieved from
   * @param {string} description a string describing property location, such as 'body.data[0]'
   * @param {any} [defaultValue] default value is returned, if property is undefined.
   * @returns {any}
   */
  function getSubProperty(debug, obj, description, defaultValue) {
    let value
    try {
      value = eval(`obj.${description}`)
      if (value === undefined) value = defaultValue
    } catch (e) {
      if (debug) console.error(e)
      value = defaultValue
    }
    return value
  }
  /**
   * @template T
   * @template {(element: T) => any} K
   * @param {T[]} arr
   * @param {K} fn
   * @return {ReturnType<K>}
   */
  function returnNonNullable(arr, fn) {
    let i = 0, r
    while (i < arr.length) {
      r = fn(arr[i++])
      if (r != null) return r
    }
    return r
  }
  /**
   * @param {config} cfg
   * @param {'clientError'|'serverError'} prop
   * @param {Response} response
   * @param {Error} error
   */
  function report(cfg, prop, response, error) {
    const value = cfg[prop]
    if (value) {
      if (value === true) {
        cfg.report(error, getSubProperty(cfg.debug, response, cfg.messageProperty), response)
      } else if (typeof value === 'string') {
        cfg.report(error, value, response)
      } else if (Array.isArray(value)) {
        cfg.report(error, returnNonNullable(value, ele => getSubProperty(cfg.debug, response, ele)), response)
      } else if (typeof value === 'function') {
        cfg.report(error, value(response), response)
      }
    }
  }
  /**
   * @this {SuperAgentRequest}
   */
  function plugin() {
    let cfg = Object.assign({}, config)
    const rawEnd = this.end
    const rawCallback = this.callback
    this.end = function end(cb) {
      if (cfg.debug) console.log(cfg)
      // use plugin before sent
      this.use(jsonp(cfg.jsonp))
      rawEnd(cb)
      return this
    }
    /**
     * @type {(error: Error, response: Response) => void}
     * @private
     */
    this.callback = function callback(error, response) {
      if (this._shouldRetry(error, response)) {
        return rawCallback.call(this, error, response)
      }
      // [response](http://visionmedia.github.io/superagent/#response-properties)
      if (response) {
        switch (response.statusType) {
          case 2:
            cfg.report(error, getSubProperty(cfg.debug, response, cfg.messageProperty), response)
            break
          case 4:
            // handle 401
            if (response.status === 401 && cfg.unauthorized) {
              if (cfg.unauthorized === true) {
                window.location.reload()
              } else if (typeof cfg.unauthorized === 'string') {
                window.location.href = cfg.unauthorized
              } else if (Array.isArray(cfg.unauthorized)) {
                window.location.href = returnNonNullable(cfg.unauthorized,
                  ele => getSubProperty(cfg.debug, response, ele))
              } else if (typeof cfg.unauthorized === 'function') {
                const url = cfg.unauthorized(response)
                if (url) window.location.href = url
              }
            } else {
              report(cfg, 'clientError', response, error)
            }
            break
          case 5:
            report(cfg, 'serverError', response, error)
            break
          default:
        }
      } else {
        cfg.report(error, error.message, null)
      }
      if (cfg.swallowError) {
        error = null
      }
      if (cfg.returnProperty) {
        response = getSubProperty(cfg.debug, response, cfg.returnProperty)
      }
      return rawCallback.call(this, error, response)
    }
    const configure = config.configure || 'configure'
    if (this[configure] !== undefined) {
      throw new Error('configure method name: ' + configure + ', is in conflict.')
    }
    /**
     * @template {Exclude<keyof config, 'configure'>} T
     * @param {T} prop
     * @param {config[T]} value
     */
    this[configure] = function(prop, value) {
      if (prop === 'jsonp') {
        Object.assign(cfg[prop], value)
      } else {
        cfg[prop] = value
      }
      return this
    }
  }
}
