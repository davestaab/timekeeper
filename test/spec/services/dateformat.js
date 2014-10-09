'use strict';

describe('Service: dateFormat', function () {

  // load the service's module
  beforeEach(module('timekeeperApp'));

  // instantiate service
  var dateFormat;
  beforeEach(inject(function (_dateFormat_) {
    dateFormat = _dateFormat_;
  }));

  it('should do something', function () {
    expect(!!dateFormat).toBe(true);
  });

});
