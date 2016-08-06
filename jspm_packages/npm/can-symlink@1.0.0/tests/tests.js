/* */ 
var assert = require('assert');
var canSymlink = require('../index');
describe('can-symlink', function() {
  it('returns true if no exceptions are thrown', function() {
    var options = {fs: {
        symlinkSync: function() {},
        writeFileSync: function() {},
        unlinkSync: function() {}
      }};
    assert.equal(canSymlink(options), true);
  });
  it('returns false if exceptions are thrown', function() {
    var options = {fs: {
        symlinkSync: function() {
          throw Error('Symlink failed');
        },
        writeFileSync: function() {},
        unlinkSync: function() {}
      }};
    assert.equal(canSymlink(options), false);
  });
});
