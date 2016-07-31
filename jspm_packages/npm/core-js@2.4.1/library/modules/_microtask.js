/* */ 
(function(process) {
  var global = require('./_global'),
      macrotask = require('./_task').set,
      Observer = global.MutationObserver || global.WebKitMutationObserver,
      process = global.process,
      Promise = global.Promise,
      isNode = require('./_cof')(process) == 'process';
  module.exports = function() {
    var head,
        last,
        notify;
    var flush = function() {
      var parent,
          fn;
      if (isNode && (parent = process.domain))
        parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (e) {
          if (head)
            notify();
          else
            last = undefined;
          throw e;
        }
      }
      last = undefined;
      if (parent)
        parent.enter();
    };
    if (isNode) {
      notify = function() {
        process.nextTick(flush);
      };
    } else if (Observer) {
      var toggle = true,
          node = document.createTextNode('');
      new Observer(flush).observe(node, {characterData: true});
      notify = function() {
        node.data = toggle = !toggle;
      };
    } else if (Promise && Promise.resolve) {
      var promise = Promise.resolve();
      notify = function() {
        promise.then(flush);
      };
    } else {
      notify = function() {
        macrotask.call(global, flush);
      };
    }
    return function(fn) {
      var task = {
        fn: fn,
        next: undefined
      };
      if (last)
        last.next = task;
      if (!head) {
        head = task;
        notify();
      }
      last = task;
    };
  };
})(require('process'));
