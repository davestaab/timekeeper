import angular from 'angular';
import registerMain from './main/index';
import ngStorage from 'ngstorage';

const ngModule = angular.module('timelineApp', [ngStorage.name]);

registerMain(ngModule);
