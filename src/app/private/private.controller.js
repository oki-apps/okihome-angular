(function() {
  'use strict';
  
  angular.module('okihome').controller('ModalAddFeedController', function ($log, $uibModalInstance, okihomeApi, toastr) {
	var vm = this;
	
	vm.itemsPerPage = 5;
	vm.currentPage = 5;

	vm.ok = function () {
		$uibModalInstance.close(vm.url);
	};

	vm.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	vm.preview = function() {
		vm.widgetTitle = vm.url;
		vm.items = [];
		
		okihomeApi.preview({ url: vm.url}, function(data){
			$log.debug("Preview data: ", data);
			
			vm.widgetTitle = data.title;
			vm.items = data.items;
			
		}, function(err){
			toastr.error('Preview data unavailable. Please check URL.');
			$log.error(err);
		});
	
	};
  });
  angular.module('okihome').controller('ModalAddEmailController', function ($log, $scope, $uibModalInstance, okihomeApi, toastr) {
	var vm = this;
	
	vm.services = [];
	okihomeApi.getServices(function(data){
		$log.debug("services: ", data)
		vm.services = data;
		vm.selectedProvider = vm.services[0];
		vm.displayAccounts();
	},function(err){
		toastr.error('Service list retrieval failed');
		$log.error(err);
	});
	
	var allAccounts = [];
	okihomeApi.getAccounts($scope.userId, function(data){
		$log.debug("accounts: ", data)
		allAccounts = data;
		vm.displayAccounts();
	},function(err){
		toastr.error('Account list retrieval failed');
		$log.error(err);
	});
	
	
	vm.displayAccounts = function() {
		vm.accounts = [];
		vm.selectedAccount = undefined;
		
		if(!vm.selectedProvider || !allAccounts) {
			return;
		}
		
		allAccounts.forEach(function(acc) {
			if(acc.provider_name === vm.selectedProvider.name) {
				vm.accounts.push(acc);
			}
		});
		
		if(vm.accounts.length > 0) {
			vm.selectedAccount = vm.accounts[0];
		}
	}
	
	vm.accounts = [];

	vm.ok = function () {
		$uibModalInstance.close(vm.selectedAccount);
	};

	vm.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	
  });
  
  angular.module('okihome').controller('ModalAddTabController', function ($log, $uibModalInstance) {
	var vm = this;
	
	vm.ok = function () {
		$uibModalInstance.close(vm.title);
	};

	vm.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
	
  });

  angular
    .module('okihome')
    .controller('PrivateController', PrivateController);

  /** @ngInject */
  function PrivateController($log, $scope, okihomeApi, $state, $uibModal, userPromise, toastr) {
    var vm = this;

	$log.debug("Entering PrivateController",userPromise);
	
	vm.logout = function() {
		okihomeApi.logout(function(){
			$state.go('home');
		});
	};
	
	vm.userId = okihomeApi.isLoggedIn();
	if(!vm.userId) {
		toastr.error('Please log in before accessing this page.');
		vm.logout();
	}
	$log.info("Connected user is", vm.userId);
	$scope.userId = vm.userId;
	
	okihomeApi.version(function(data){
		vm.version = data.version;
	},function(err){
		$log.error(err);
	});
	
	$scope.user = userPromise.data;

	vm.currentTabId = undefined;
	$scope.setCurrentTabId = function(tabId) {
		$log.debug("setCurrentTabId: ", tabId)
		vm.currentTabId = tabId;
	};
	$scope.unsetCurrentTabId = function(tabId) {
		$log.debug("unsetCurrentTabId: ", tabId)
		if(vm.currentTabId == tabId) {
			vm.currentTabId = undefined;
		}
	};

	$scope.addUnreadCount = function(tabId, count) {
		$scope.user.tabs.forEach(function(t) {
			if(t.id == tabId) {
				if(t.unreadCount) {
					t.unreadCount += count;
				} else {
					t.unreadCount = count;
				}

				if(t.unreadCount<0) {
					$log.warn("Mismatch on unread count", tabId, t.unreadCount);
					t.unreadCount=0;
				}
			}
		});
	};
	
	vm.addTab = function($event) {
		$event.preventDefault();
		
		
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalAddTab.html',
			controller: 'ModalAddTabController',
			controllerAs: 'vm',
			size: 'lg'
		});

		modalInstance.result.then(function (title) {
			
			okihomeApi.newTab({
				title: title
			}, function(data){
				$log.debug("newTab", data)
				if($scope.user.tabs) {
					$scope.user.tabs.push(data);
				} else {
					$scope.user.tabs = [data];
				}
				toastr.success('Add items by clicking on +', 'New tab created');
				
				$state.go('private.tab', {tabId: data.id});
			}, function(err){
				toastr.error('Unable to add tab');
				$log.error(err)
			});
			
			$log.debug('Modal closed: ', title);
		}, function () {
			$log.debug('Modal dismissed at: ' + new Date());
		});
		
		return false;
		
	};
	
	vm.addFeed = function($event) {
		$event.preventDefault();
		
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalAddFeed.html',
			controller: 'ModalAddFeedController',
			controllerAs: 'vm',
			size: 'lg'
		});

		modalInstance.result.then(function (url) {
			
			okihomeApi.newWidget(vm.currentTabId, {
				widgetType: 'feed',
				config: {
					url: url,
					display_count: 5
				}
			}, function(data){
				toastr.success('The new widget was added.');
				$scope.$broadcast("contentChanged", data);
			}, function(err){
				toastr.error('Unable to add feed widget.');
				$log.error(err)
			});
			
			$log.debug('Modal closed: ', url);
		}, function () {
			$log.debug('Modal dismissed at: ' + new Date());
		});
		
		return false;
	};
	vm.addEmail = function($event) {
		$event.preventDefault();
		
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalAddEmail.html',
			controller: 'ModalAddEmailController',
			controllerAs: 'vm',
			size: 'lg',
			scope: $scope
		});

		modalInstance.result.then(function (account) {
			
			okihomeApi.newWidget(vm.currentTabId, {
				widgetType: 'email',
				config: {
					account_id: account.id
				}
			}, function(data){
				toastr.success('The new widget was added.');
				$scope.$broadcast("contentChanged", data);
			}, function(err){
				toastr.error('Unable to add email widget.');
				$log.error(err)
			});
			
			$log.debug('Modal closed: ', account);
		}, function () {
			$log.debug('Modal dismissed at: ' + new Date());
		});
		
		return false;
	};
	vm.addSocialApp = function($event) {
		$event.preventDefault();
	};
	
  }
})();
