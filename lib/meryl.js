/*!
 * Meryl
 * Copyright(c) 2010 Kadir Pekel.
 * MIT Licensed
 */

/*
 * Modules dependencies
 */
var sys = require('sys'),
    url = require('url');

/*
 * Variable definitions.
 */
var handlers = [],  // Handler registry
    plugins = [],  // Plugin registry
    extensions = [], // Extension Registry
    notFoundHandler = function () { // Default 404 not found handler
      if (this.status >= 200 && this.status < 300) this.status = 404;
      this.send('<h3>Not Found</h3><pre>'
        + this.params.pathname
        + '</pre>');
    },
    errorHandler = function (e) { // Default 500 error handler
      if (this.status >= 200 && this.status < 300) this.status = 500;
      this.send('<h3>Server error</h3><pre>'
        + ((e instanceof Error && !this.options.prod) ? e.stack : e)
        + '</pre>');
    };

/*
 * Parses path expression and extract path variables
 *
 * @param {String} expr
 * @param {String} path
 * @return {Object}
 * @api private
 */
var parsePath = function (expr, path) {
  var p1 = "{([^}]+)}",
      p2 = "<([^>]+)>",
      rA = new RegExp("(?:" + p1 + ")|(?:" + p2 + ")", "gi"),
      keys = [],
      values = null,
      capture = null;
  while (capture = rA.exec(expr)) {
    keys.push(capture[1] || capture[2]);
  }
  var rB = new RegExp("^"
    + expr.replace(/\(/, "(?:", "gi")
          .replace(/\./, "\\\.", "gi")
          .replace(/\*/, ".*", "gi")
          .replace(new RegExp(p1, "gi"), "([^/\.\?]+)")
          .replace(new RegExp(p2, "gi"), "(.+)")
    + "$");
  if (values = rB.exec(path)) {
    var result = {};
    values.shift();
    if (values.length == keys.length) {
      for (var i in keys) {
        result[keys[i]] = values[i];
      }
    }
    return result;
  }
  return null;
};

/*
 * Process incoming requests and do main routing
 * operations through handlers and plugins by chaining matched
 * ones with each other
 *
 * @param {Array} infra
 * @param {Object} ctx
 * @return {undefined}
 * @api private
 */
function proc(infra, ctx) {
  var i = 0;
  function chain() {
    var procunit = infra[i++];
    if (procunit && procunit.pattern) {
      var parts = parsePath(procunit.pattern, ctx.request.method
        + ' ' + ctx.params.pathname);
      if (parts) {
        if (procunit.cb) {
          for (var key in parts)
            ctx.params[key] = parts[key];
          for (var key in ctx.params.query)
            ctx.params[key] = ctx.params.query[key];
          ctx.params.query = undefined;
          procunit.cb.call(ctx, chain);
        }
      } else {
        chain();
      }
    }
  }
  try {
    chain();
  } catch (e) {
    if (errorHandler) {
      errorHandler.call(ctx, e);
    }
  }
}

var Meryl = function() {
  // Aliases
  this.h = this.handler;
  this.p = this.plugin;
  this.x = this.extend;
  this.errHnd = this.errorHandler;
  this.notFndHnd = this.notFound = this.notFoundHandler;
}

Meryl.prototype = {
  /*
   * Handler registration function
   *
   * @param {String} pattern
   * @param {Function} cb
   * @return {Object} this
   * @api public
   */
  handler: function (pattern, cb) {
    handlers.push({
      pattern: pattern,
      cb: cb
    });
    return this;
  },

  /*
   * Plugin registration function
   *
   * @param {String} pattern
   * @param {Function} cb
   * @return {Object} this
   * @api public
   */
  plugin: function (pattern, cb) {
    plugins.push({
      pattern: pattern,
      cb: cb
    });
    return this;
  },

  /*
   * Extension registration function
   *
   * @param {String} key
   * @param {Object} value
   * @return {Object} this
   * @api public
   */
  extend: function (key, value) {
    extensions.push({
      key: key,
      value: value
    });
    return this;
  },

  /*
   * Function for defining custom error handlers
   *
   * @param {Function} cb
   * @return {Object} this
   * @api public
   */
  errorHandler: function (cb) {
    errorHandler = cb;
    return this;
  },

  /*
   * Function for defining custom resource not found handler
   *
   * @param {Function} cb
   * @return {Object} this
   * @api public
   */
  notFoundHandler: function (cb) {
    notFoundHandler = cb;
    return this;
  },

  /*
   * Main entry point of Meryl. It pushes some initial
   * preperations for handling http requests.
   *
   * Examples:
   *
   *  require('http').createServer(meryl.cgi({debug: 1})).listen(3000);
   *
   * @param {object} opts
   * @return {Function}
   * @api public
   */

  cgi: function (opts) {
    var opts = opts || {};
    var infra = plugins.concat(handlers);
    infra.push({
      pattern: "*",
      cb: notFoundHandler
    });
    return function (req, resp) {
      var ctx = {
        params: url.parse(req.url, true),
        headers: {
          'Content-Type': 'text/html'
        },
        status: 200,
        send: function (data, enc) {
          resp.writeHead(this.status, this.headers);
          resp.end(data, enc || 'utf-8');
        },
        options: opts,
        request: req,
        response: resp
      };
      for (var i in extensions) {
        var extension = extensions[i];
        ctx[extension.key] = extension.value;
      }
      req.addListener('data', function (data) {
        if (!ctx.postdata) {
          ctx.postdata = data;
        } else {
          ctx.postdata += data;
        }
      }).addListener('end', function () {
        proc(infra, ctx);
      });
    };
  }
}

module.exports = new Meryl;
