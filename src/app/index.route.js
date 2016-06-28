(function() {
  'use strict';

  angular
    .module('okihome')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeController',
        controllerAs: 'home'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'app/home/home.html',
        controller: 'HomeController',
        controllerAs: 'home'
      })
      .state('private', {
        abstract: true,
        url: '/private',
        templateUrl: 'app/private/private.html',
        controller: 'PrivateController',
        controllerAs: 'private',
        resolve: {
          userPromise : function(okihomeApi) {
            return okihomeApi.getUser(okihomeApi.isLoggedIn());
          }
        }
      })
      .state('private.settings', {
        url: '/settings',
        templateUrl: 'app/settings/settings.html',
        controller: 'SettingsController',
        controllerAs: 'settings'
      })
      .state('private.tab', {
        url: '/tabs/{tabId:int}',
        templateUrl: 'app/tab/tab.html',
        controller: 'TabController',
        controllerAs: 'tab'
      })
      .state('private.tabsettings', {
        url: '/tabs/{tabId:int}/settings',
        templateUrl: 'app/tabSettings/tabSettings.html',
        controller: 'TabSettingsController',
        controllerAs: 'vm',
        resolve: {
          tabPromise : function(okihomeApi,$stateParams) {
            return okihomeApi.getTab($stateParams.tabId);
          }
        }
      })
    ;

    $urlRouterProvider.otherwise('/');
  }

})();
