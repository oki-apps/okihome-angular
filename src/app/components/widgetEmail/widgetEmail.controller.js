(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('WidgetEmailController', WidgetEmailController);
	
  angular
    .module('okihome')
    .config(register);

  /** @ngInject */
  function register(widgetRegistryProvider) {
	
	widgetRegistryProvider.register("email", {
		allowMarkAllRead: false,
		templateUrl: 'app/components/widgetEmail/widgetEmail.html',
		controller: 'WidgetEmailController',
		retrieveData : function(okihomeApi, userId, widget, unreadCount) {
			
			return okihomeApi.getEmailItems(userId, widget.config.account_id)
				.then(function(data) {
					widget.widgetData.items = data.data.items;
				
					widget.widgetData.unreadItems = 0
					widget.widgetData.items.forEach(function(e){
						if(!e.read) {
							widget.widgetData.unreadItems++;
						}
					});
				
					unreadCount({count: widget.widgetData.unreadItems});
				});
		}
	});
  }
  
  /** @ngInject */
  function WidgetEmailController($scope) {
	$scope.vm.widget.config.display_count = $scope.vm.widget.config.display_count || 5;
  }
})();
