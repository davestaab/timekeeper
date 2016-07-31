/* */ 
(function(process) {
  'use strict';
  var utils = require('./utils');
  var Glob = require('./glob');
  module.exports = expand;
  function expand(pattern, options) {
    if (typeof pattern !== 'string') {
      throw new TypeError('micromatch.expand(): argument should be a string.');
    }
    var glob = new Glob(pattern, options || {});
    var opts = glob.options;
    if (!utils.isGlob(pattern)) {
      glob.pattern = glob.pattern.replace(/([\/.])/g, '\\$1');
      return glob;
    }
    glob.pattern = glob.pattern.replace(/(\+)(?!\()/g, '\\$1');
    glob.pattern = glob.pattern.split('$').join('\\$');
    if (typeof opts.braces !== 'boolean' && typeof opts.nobraces !== 'boolean') {
      opts.braces = true;
    }
    if (glob.pattern === '.*') {
      return {
        pattern: '\\.' + star,
        tokens: tok,
        options: opts
      };
    }
    if (glob.pattern === '*') {
      return {
        pattern: oneStar(opts.dot),
        tokens: tok,
        options: opts
      };
    }
    glob.parse();
    var tok = glob.tokens;
    tok.is.negated = opts.negated;
    if ((opts.dotfiles === true || tok.is.dotfile) && opts.dot !== false) {
      opts.dotfiles = true;
      opts.dot = true;
    }
    if ((opts.dotdirs === true || tok.is.dotdir) && opts.dot !== false) {
      opts.dotdirs = true;
      opts.dot = true;
    }
    if (/[{,]\./.test(glob.pattern)) {
      opts.makeRe = false;
      opts.dot = true;
    }
    if (opts.nonegate !== true) {
      opts.negated = glob.negated;
    }
    if (glob.pattern.charAt(0) === '.' && glob.pattern.charAt(1) !== '/') {
      glob.pattern = '\\' + glob.pattern;
    }
    glob.track('before braces');
    if (tok.is.braces) {
      glob.braces();
    }
    glob.track('after braces');
    glob.track('before extglob');
    if (tok.is.extglob) {
      glob.extglob();
    }
    glob.track('after extglob');
    glob.track('before brackets');
    if (tok.is.brackets) {
      glob.brackets();
    }
    glob.track('after brackets');
    glob._replace('[!', '[^');
    glob._replace('(?', '(%~');
    glob._replace(/\[\]/, '\\[\\]');
    glob._replace('/[', '/' + (opts.dot ? dotfiles : nodot) + '[', true);
    glob._replace('/?', '/' + (opts.dot ? dotfiles : nodot) + '[^/]', true);
    glob._replace('/.', '/(?=.)\\.', true);
    glob._replace(/^(\w):([\\\/]+?)/gi, '(?=.)$1:$2', true);
    if (glob.pattern.indexOf('[^') !== -1) {
      glob.pattern = negateSlash(glob.pattern);
    }
    if (opts.globstar !== false && glob.pattern === '**') {
      glob.pattern = globstar(opts.dot);
    } else {
      glob.pattern = balance(glob.pattern, '[', ']');
      glob.escape(glob.pattern);
      if (tok.is.globstar) {
        glob.pattern = collapse(glob.pattern, '/**');
        glob.pattern = collapse(glob.pattern, '**/');
        glob._replace('/**/', '(?:/' + globstar(opts.dot) + '/|/)', true);
        glob._replace(/\*{2,}/g, '**');
        glob._replace(/(\w+)\*(?!\/)/g, '$1[^/]*?', true);
        glob._replace(/\*\*\/\*(\w)/g, globstar(opts.dot) + '\\/' + (opts.dot ? dotfiles : nodot) + '[^/]*?$1', true);
        if (opts.dot !== true) {
          glob._replace(/\*\*\/(.)/g, '(?:**\\/|)$1');
        }
        if (tok.path.dirname !== '' || /,\*\*|\*\*,/.test(glob.orig)) {
          glob._replace('**', globstar(opts.dot), true);
        }
      }
      glob._replace(/\/\*$/, '\\/' + oneStar(opts.dot), true);
      glob._replace(/(?!\/)\*$/, star, true);
      glob._replace(/([^\/]+)\*/, '$1' + oneStar(true), true);
      glob._replace('*', oneStar(opts.dot), true);
      glob._replace('?.', '?\\.', true);
      glob._replace('?:', '?:', true);
      glob._replace(/\?+/g, function(match) {
        var len = match.length;
        if (len === 1) {
          return qmark;
        }
        return qmark + '{' + len + '}';
      });
      glob._replace(/\.([*\w]+)/g, '\\.$1');
      glob._replace(/\[\^[\\\/]+\]/g, qmark);
      glob._replace(/\/+/g, '\\/');
      glob._replace(/\\{2,}/g, '\\');
    }
    glob.unescape(glob.pattern);
    glob._replace('__UNESC_STAR__', '*');
    glob._replace('?.', '?\\.');
    glob._replace('[^\\/]', qmark);
    if (glob.pattern.length > 1) {
      if (/^[\[?*]/.test(glob.pattern)) {
        glob.pattern = (opts.dot ? dotfiles : nodot) + glob.pattern;
      }
    }
    return glob;
  }
  function collapse(str, ch) {
    var res = str.split(ch);
    var isFirst = res[0] === '';
    var isLast = res[res.length - 1] === '';
    res = res.filter(Boolean);
    if (isFirst)
      res.unshift('');
    if (isLast)
      res.push('');
    return res.join(ch);
  }
  function negateSlash(str) {
    return str.replace(/\[\^([^\]]*?)\]/g, function(match, inner) {
      if (inner.indexOf('/') === -1) {
        inner = '\\/' + inner;
      }
      return '[^' + inner + ']';
    });
  }
  function balance(str, a, b) {
    var aarr = str.split(a);
    var alen = aarr.join('').length;
    var blen = str.split(b).join('').length;
    if (alen !== blen) {
      str = aarr.join('\\' + a);
      return str.split(b).join('\\' + b);
    }
    return str;
  }
  var qmark = '[^/]';
  var star = qmark + '*?';
  var nodot = '(?!\\.)(?=.)';
  var dotfileGlob = '(?:\\/|^)\\.{1,2}($|\\/)';
  var dotfiles = '(?!' + dotfileGlob + ')(?=.)';
  var twoStarDot = '(?:(?!' + dotfileGlob + ').)*?';
  function oneStar(dotfile) {
    return dotfile ? '(?!' + dotfileGlob + ')(?=.)' + star : (nodot + star);
  }
  function globstar(dotfile) {
    if (dotfile) {
      return twoStarDot;
    }
    return '(?:(?!(?:\\/|^)\\.).)*?';
  }
})(require('process'));
