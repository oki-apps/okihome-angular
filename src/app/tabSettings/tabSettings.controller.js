(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('TabSettingsController', TabSettingsController);

  /** @ngInject */
  function TabSettingsController($log, $scope, $state, $stateParams, okihomeApi, $timeout, tabPromise, toastr) {
    var vm = this;
	
	vm.tabId = $stateParams.tabId;
	vm.tab = tabPromise.data;

	vm.editedTab = {
		title: vm.tab.title
	};

	vm.deleteTab = function() {
		var confirmation = confirm("Please confirm that you want to permanently delete the tab '" +vm.tab.title+ "'. This operation can't be reverted.");

		if(confirmation) {
	
			var oldTab;
			var oldIndex = $scope.user.tabs.length;
			for(var i=0; i<$scope.user.tabs.length; i++) {
				if($scope.user.tabs[i].id == vm.tabId) {
					oldTab = $scope.user.tabs[i];
					oldIndex = i;
					break;
				}
			}

			$scope.user.tabs.splice(oldIndex,1);

			okihomeApi.removeTab(vm.tabId).then(function(data) {
				$log.debug("tab removed", data);
				toastr.success('Tab removed');
				if($scope.user.tabs.length>0) {
					$state.go('private.tab', {tabId: $scope.user.tabs[0].id});
				} else {
					$state.go('private.settings');
				}
			}, function(err){
				$scope.user.tabs.splice(oldIndex,0,oldTab);
				$log.error("removeTab failed", err);
				toastr.error('Tab removal failed');
			});
		}
	};

	vm.editTab = function() {

		$log.debug("Editing tab",vm.editedTab.title,vm.tab.title);

		if(vm.editedTab.title != vm.tab.title) {

			var oldTitle = vm.tab.title;
			vm.tab.title = vm.editedTab.title;
			$scope.user.tabs.forEach(function(t) {
				if(t.id == vm.tabId) {
					t.title = vm.editedTab.title;
				}
			});

			okihomeApi.editTab(vm.tabId, vm.editedTab).then(function(data) {
				$log.debug("editTab ok", data)
				toastr.success('Tab configutation saved');
			}, function(err){
				vm.tab.title = oldTitle;
				$scope.user.tabs.forEach(function(t) {
					if(t.id == vm.tabId) {
						t.title = oldTitle;
					}
				});
				toastr.error('Unable to save tab configuration');
				$log.Error("editTab failed", err);
			});
		}
	};

  }
})();
