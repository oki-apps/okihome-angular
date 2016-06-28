(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('SettingsController', SettingsController);

	function PopupCenter($window, $document, url, title, w, h) {
		// Fixes dual-screen position                         Most browsers      Firefox
		var dualScreenLeft = $window.screenLeft != undefined ? $window.screenLeft : screen.left;
		var dualScreenTop = $window.screenTop != undefined ? $window.screenTop : screen.top;

		var width = $window.innerWidth ? $window.innerWidth : $document.documentElement.clientWidth ? $document.documentElement.clientWidth : screen.width;
		var height = $window.innerHeight ? $window.innerHeight : $document.documentElement.clientHeight ? $document.documentElement.clientHeight : screen.height;

		var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		var top = ((height / 2) - (h / 2)) + dualScreenTop;
		var newWindow = $window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		// Puts focus on the newWindow
		if (newWindow.focus) {
			newWindow.focus();
		}
	}
	
  /** @ngInject */
  function SettingsController($window, $document, $log, $scope,okihomeApi,urls,$sessionStorage, toastr) {
    var vm = this;
	
		
	vm.services = [];
	okihomeApi.getServices(function(data){
		$log.debug("services", data)
		vm.services = data;
	},function(err){
		toastr.error('Unable to retrieve the list of available services');
		$log.error(err);
	});
	
	vm.accounts = [];
	okihomeApi.getAccounts($scope.userId, function(data){
		vm.accounts = data;
	},function(err){
		toastr.error('Unable to retrieve the list of existing accounts');
		$log.error(err);
	});
	
	vm.serviceTitle = function(serviceName) {
		var serviceTitle = serviceName;
		vm.services.forEach(function(s){
			if(s.name == serviceName) {
				serviceTitle = s.title;
			}
		});
		return serviceTitle;
	}
	vm.connect = function($event, service) {
		$event.preventDefault();
		
		var url = urls.BASE+"/pages/services/"+service.name+"/register?auth=";
		url += $sessionStorage.token;
		PopupCenter($window,$document,url,"Okihome connection to " + service.title,480,400);
	};
	vm.disconnect = function($event, index) {
		$event.preventDefault();
		
		var account = vm.accounts.splice(index,1)
		$log.debug("Revoke", account[0]);
		
		okihomeApi.revokeAccount($scope.userId, account[0].id, function(data){
			toastr.success('Account revoked');
			$log.debug("revokeAccount", data);
		},function(err){
			toastr.error('Unable to revoke account');
			vm.accounts.splice(index,0,account);
			$log.error(err);
		});
	};
	/* TODO
	vm.importConfig = function() {
		
	};
	vm.exportConfig = function() {
		
	};*/
	
  }
})();
