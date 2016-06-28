(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController($log, $scope, okihomeApi, $state, toastr) {
    var vm = this;
	
	//Test if not already logged in (ex: from a previous session)
	//In this case the log in page can be skipped !
	var userId = okihomeApi.isLoggedIn();
	
	var redirect = function(userId) {
		okihomeApi.getUser(userId).success(function(data){
			if(data.tabs) {
				$state.go('private.tab', {tabId: data.tabs[0].id});
			} else {
				$state.go('private.settings');
			}
		}).error(function(err) {
			toastr.error('Unable to get list of tabs.');
			$log.error(err)
		});
	}
	if(userId) {
		redirect(userId);
	}
	
	okihomeApi.version(function(data){
		vm.version = data.version;
	},function(err){
		$log.error(err);
	});
	
	vm.login = function() {
		vm.processing = true;
		vm.errorMsg = "";
		okihomeApi.login(vm.username, vm.password, vm.rememberMe, function() {
			vm.processing = false;
			redirect(vm.username);
		}, function(message) {
			vm.errorMsg = message;
			vm.processing = false;
		});
	};
	
  }
})();
