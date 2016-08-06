/* */ 
var $export = require('./_export'),
    create = require('./_object-create'),
    aFunction = require('./_a-function'),
    anObject = require('./_an-object'),
    isObject = require('./_is-object'),
    fails = require('./_fails'),
    bind = require('./_bind'),
    rConstruct = (require('./_global').Reflect || {}).construct;
var NEW_TARGET_BUG = fails(function() {
  function F() {}
  return !(rConstruct(function() {}, [], F) instanceof F);
});
var ARGS_BUG = !fails(function() {
  rConstruct(function() {});
});
$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {construct: function construct(Target, args) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG)
      return rConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      switch (args.length) {
        case 0:
          return new Target;
        case 1:
          return new Target(args[0]);
        case 2:
          return new Target(args[0], args[1]);
        case 3:
          return new Target(args[0], args[1], args[2]);
        case 4:
          return new Target(args[0], args[1], args[2], args[3]);
      }
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args));
    }
    var proto = newTarget.prototype,
        instance = create(isObject(proto) ? proto : Object.prototype),
        result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }});
