(function() {
  'use strict';

  angular
    .module('okihome')
    .controller('WidgetRssFeedController', WidgetRssFeedController);
	
  angular
    .module('okihome')
    .config(register);

  /** @ngInject */
  function register(toastrConfig, widgetRegistryProvider) {
	
	widgetRegistryProvider.register("feed", {
		allowMarkAllRead: true,
		templateUrl: 'app/components/widgetRssFeed/widgetRssFeed.html',
		controller: 'WidgetRssFeedController',
		retrieveData : function(okihomeApi, userId, widget, unreadCount) {
			
			return okihomeApi.getFeedItems(userId, widget.config.feed_id)
				.then(function(data) {
					widget.widgetData.items = data.data;
				
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
  function WidgetRssFeedController($log, $scope, okihomeApi, toastr) {
		
	var readItem = function(item) {
		if(!item.read) {
			$log.debug("mark as read", item);
		item.read = true;
		$scope.vm.widget.widgetData.unreadItems--;
		$scope.vm.unreadCount({count:-1});
		okihomeApi.readFeedItem($scope.vm.user,$scope.vm.widget.config.feed_id,item.guid, function(){
			//Nothing to do
		},function(err){
			toastr.error('Unable to mark item has read');
			$log.error(err);
			item.read = false;
			$scope.vm.widget.widgetData.unreadItems++;
			$scope.vm.unreadCount({count:+1});
		});
		}
	};
	
	$scope.readItem = readItem;
	
	$scope.$on('markAllRead', function(){
		$log.debug('markAllRead');
		
		$scope.vm.widget.widgetData.items.forEach(function(item) {
			if(!item.read) {
				readItem(item);
			}
		});
	});
	
  }
})();
