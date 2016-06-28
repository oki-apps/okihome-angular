/* global angularDragula:false */
(function() {
  'use strict';
  
  angular
    .module('okihome', [
		'ngAnimate', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 
		'ui.router', 
		'ui.bootstrap', 
		'angular-loading-bar',
		'ngStorage',
		'angularMoment',
		'toastr', 
		angularDragula(angular)]);

})();
