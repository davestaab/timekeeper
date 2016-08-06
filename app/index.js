import angular from 'angular';
import registerMain from './main/index';

console.log('hello world!');

const ngModule = angular.module('timelineApp', []);

registerMain(ngModule);
