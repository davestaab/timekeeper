/* */ 
var apply = require('./_apply'),
    baseRest = require('./_baseRest'),
    mergeDefaults = require('./_mergeDefaults'),
    mergeWith = require('./mergeWith');
var defaultsDeep = baseRest(function(args) {
  args.push(undefined, mergeDefaults);
  return apply(mergeWith, undefined, args);
});
module.exports = defaultsDeep;
