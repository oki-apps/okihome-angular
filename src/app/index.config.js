(function() {
  'use strict';

  angular
    .module('okihome')
    .config(config)
    .config(authConfig);

  /** @ngInject */
  function config($logProvider, toastrConfig) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
  }
  
  /** @ngInject */
  function authConfig($httpProvider) {
	$httpProvider.interceptors.push(function ($q, $injector, $localStorage, $sessionStorage, $log) {
		return {
			'request': function (config) {
				config.headers = config.headers || {};
				if ($sessionStorage.token) {
					config.headers.Authorization = 'Bearer ' + $sessionStorage.token;
				} else if ($localStorage.token) {
					config.headers.Authorization = 'Bearer ' + $localStorage.token;
				}
				return config;
			},
			'responseError': function (response) {
				if (response.status === 401 || response.status === 403) {
					delete $localStorage.token;
					delete $sessionStorage.token;
					$injector.get('$state').transitionTo('home');
				}
				return $q.reject(response);
			}
		};
	});
  }

})();
