/* */ 
var dP = require('./_object-dp').f,
    createDesc = require('./_property-desc'),
    has = require('./_has'),
    FProto = Function.prototype,
    nameRE = /^\s*function ([^ (]*)/,
    NAME = 'name';
var isExtensible = Object.isExtensible || function() {
  return true;
};
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function() {
    try {
      var that = this,
          name = ('' + that).match(nameRE)[1];
      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
      return name;
    } catch (e) {
      return '';
    }
  }
});
