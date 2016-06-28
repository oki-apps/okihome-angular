(function() {
  'use strict';
  
  angular
	.module('okihome')
	.service('okihomeApi', okihomeApi);
	
  /** @ngInject */
  function okihomeApi($log, $window, $http, urls, $localStorage, $sessionStorage) {
	function urlBase64Decode(str) {
		var output = str.replace('-', '+').replace('_', '/');
		switch (output.length % 4) {
		case 0:
			break;
		case 2:
			output += '==';
			break;
		case 3:
			output += '=';
			break;
		default:
			throw 'Illegal base64url string!';
		}
		return $window.atob(output);
	}
	
	//----- API version -----
	var version = function (success, error) {
		$http.get(urls.BASE_API + '/version').success(success).error(error);
	};
	
	//----- Login/logout ----
	var isLoggedIn = function() {
		var token = $sessionStorage.token;
		if (typeof token === 'undefined') {
			token = $localStorage.token;
			$sessionStorage.token = token;
		}
		if (typeof token !== 'undefined') {
			var encoded = token.split('.')[1];
			var claims = angular.fromJson(urlBase64Decode(encoded));
			return claims.userId;
		}
		return undefined;
	};
	var login = function(login, password, rememberMe, success, error) {
		$http.post(urls.BASE_API + '/login', {
			userId: login,
			password: password
		}).success(function(data){
		
			if(rememberMe) {
				$localStorage.token = data.token;
			}
			$sessionStorage.token = data.token;
			data.token = undefined;
			
			$log.info("Successfull authentication");
			success(data);
		}).error(error);
	};
	var logout = function (success) {
		delete $sessionStorage.token;
		delete $localStorage.token;
		success();
	};
	
	//----- User mgmnt -----
	var getUser = function(userId) {
		return $http.get(urls.BASE_API + '/users/'+userId);
	};
	//----- Services and accounts mgmnt -----
	var getServices = function(success, error) {
		$http.get(urls.BASE_API + '/services').success(success).error(error);
	};
	var getAccounts = function(userId, success, error) {
		$http.get(urls.BASE_API + '/users/'+userId+'/accounts').success(success).error(error);
	};
	var revokeAccount = function(userId, accountID, success, error) {
		$http.delete(urls.BASE_API + '/users/'+userId+'/accounts/'+accountID).success(success).error(error);
	};
	//----- Tabs mgmnt -----
	var newTab = function(tab , success, error) {
		$http.post(urls.BASE_API + '/tabs', tab).success(success).error(error);
	};
	var getTab = function(tabId) {
		return $http.get(urls.BASE_API + '/tabs/'+tabId)
	};
	var editTab = function(tabId, changes) {
		return $http.post(urls.BASE_API + '/tabs/'+tabId, changes)
	};
	var removeTab = function(tabId) {
		return $http.delete(urls.BASE_API + '/tabs/'+tabId)
	};
	var newWidget = function(tabId, widget, success, error) {
		$log.debug("newWidget", tabId, widget);
		$http.post(urls.BASE_API + '/tabs/'+tabId+'/widgets', widget).success(success).error(error);
	};
	var saveLayout = function(tabId, layout, success, error) {
		$log.debug("saveLayout", tabId, layout);
		$http.post(urls.BASE_API + '/tabs/'+tabId+'/layout', layout).success(success).error(error);
	};
	var removeWidget = function(tabId, widgetID, success, error) {
		$log.debug("removeWidget", tabId, widgetID);
		$http.delete(urls.BASE_API + '/tabs/'+tabId+'/widgets/'+widgetID).success(success).error(error);
	};
	var saveWidgetConfig = function(tabId, widgetID, data) {
		$log.debug("saveWidgetConfig", tabId, widgetID);
		return $http.post(urls.BASE_API + '/tabs/'+tabId+'/widgets/'+widgetID, data);
	};
	var preview = function(widgetConfig, success, error) {
		$log.debug("preview", widgetConfig);
		$http.post(urls.BASE_API + '/preview', widgetConfig).success(success).error(error);
	};
	//----- Feeds mgmnt -----
	var getFeedItems = function(userId, feedID) {
		return $http.get(urls.BASE_API + '/users/'+userId+'/feeds/'+feedID+'/items');
	};
	var readFeedItem = function(userId, feedId, itemGuid, success, error) {
		$log.debug("readFeedItem");
		$http.post(urls.BASE_API + '/users/'+userId+'/feeds/'+feedId, {guids: [itemGuid]}).success(success).error(error);
	};
	//----- Emails mgmnt -----
	var getEmailItems = function(userId, accountID) {
		return $http.get(urls.BASE_API + '/users/'+userId+'/accounts/'+accountID+'/emails');
	};
	
	// Public API here
	return {
		//----- API version -----
		version: version,
		//----- Login/logout ----
		isLoggedIn: isLoggedIn,
		login: login,
		logout: logout,
		//----- User mgmnt -----
		getUser: getUser,
		//----- Services and accounts mgmnt -----
		getServices: getServices,
		getAccounts: getAccounts,
		revokeAccount: revokeAccount,
		//----- Tabs mgmnt -----
		newTab: newTab,
		getTab: getTab,
		editTab: editTab,
		removeTab: removeTab,
		newWidget: newWidget,
		removeWidget: removeWidget,
		saveWidgetConfig: saveWidgetConfig,
		saveLayout: saveLayout,
		preview: preview,
		//----- Feeds mgmnt -----
		getFeedItems: getFeedItems,
		readFeedItem: readFeedItem,
		//----- Emails mgmnt -----
		getEmailItems: getEmailItems
	};
  }
  
})();
