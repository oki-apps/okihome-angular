(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('TabController', TabController);

  /** @ngInject */
  function TabController($log, $scope, $stateParams, okihomeApi, $timeout, toastr) {
    var vm = this;
	
	vm.tabId = $stateParams.tabId;
	vm.userId = $scope.userId;
	$scope.setCurrentTabId(vm.tabId);
	$scope.$on('$destroy', function () {
		$scope.unsetCurrentTabId(vm.tabId);
	});

	vm.addUnreadCount = function(count) {
		$scope.addUnreadCount(vm.tabId,count);
	}
	
	vm.widgets = [{},{},{},{}];
	
	vm.updateLayout = function(data){
		$log.debug('updateLayout requested', data);
		
		okihomeApi.getTab(vm.tabId).then(function(data){
			$log.debug('Tab retrieved',data);
			vm.tab = data.data;
			vm.widgets = vm.tab.widgets;
		},function(err){
			toastr.error('Failed updating layout');
			$log.error(err);
		});
	};
	vm.updateLayout();
	
	$scope.$on('contentChanged', vm.updateLayout);
	
	vm.removeWidget = function(widgetId) {
		okihomeApi.removeWidget(vm.tabId,widgetId,function(data){
			$log.debug('Remove widget',data);
			vm.updateLayout();
			toastr.success('Widget removed');
		}, function(err) {
			toastr.error('Unable to remove widget');
			$log.error(err);
		});
	};
	
	var saveLayout = function() {
		
		var widgetLayout = []
		for(var col=0; col<vm.widgets.length; col ++){
			var ids = []
			for(var i=0; i<vm.widgets[col].length; i++){
				ids.push(vm.widgets[col][i].id)
			}
			widgetLayout.push(ids)
		}
		
		$log.debug("Saving layout", widgetLayout);
		okihomeApi.saveLayout(vm.tabId, widgetLayout, function(data){
			toastr.success('New layout saved');
			$log.debug("layout saved", data);
		}, function(err) {
			toastr.error('Unable to save the new layout');
			$log.error("layout saving error", err);
		});
	}
	
	
	$scope.$on('widget-bag.dragend', function(el){
		$log.debug("dragend", el);
		$timeout(saveLayout,0);
	});
	
  }
})();
