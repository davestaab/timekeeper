'use strict';

describe('Service: dateFormatConst', function () {

  // load the service's module
  beforeEach(module('timekeeperApp'));

  // instantiate service
  var dateFormatConst;
  beforeEach(inject(function (_dateFormatConst_) {
    dateFormatConst = _dateFormatConst_;
  }));

  it('should do something', function () {
    expect(!!dateFormatConst).toBe(true);
  });

});
