'use strict';

describe('Directive: timeChart', function () {

  // load the directive's module
  beforeEach(module('timekeeperApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<time-chart></time-chart>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the timeChart directive');
  }));
});
