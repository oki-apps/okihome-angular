(function() {
  'use strict';

  angular
    .module('okihome')
    .directive('okiWidget', okiWidget);
  angular
    .module('okihome')
    .directive('okiWidgetContent', okiWidgetContent);

  /** @ngInject */
  function okiWidget() {
    var directive = {
		restrict: 'E',
		templateUrl: 'app/components/widget/widget.html',
		scope: {
			widget: '=',
			tab: '=',
			user: '=',
			onRemove: '&',
			unreadCount: '&'
		},
		controller: WidgetController,
		controllerAs: 'vm',
		bindToController: true
    };

    return directive;

    /** @ngInject */
    function WidgetController($log, widgetRegistry, okihomeApi, $scope, toastr) {
		var vm = this;
		vm.editMode = false;
		
		vm.widgetType = widgetRegistry.get(vm.widget.widgetType);
		if(!vm.widgetType) {
			vm.widgetType = widgetRegistry.register(vm.widget.widgetType, {})
		}
		
		var retrieveData = function() {
			vm.widget.widgetData = vm.widget.widgetData || { items : [], unreadItems: 0};
			vm.unreadCount({count: -vm.widget.widgetData.unreadItems});
			
			$log.debug("retrieve data", vm.user, vm.widget);
			vm.widgetType.options.retrieveData(okihomeApi, vm.user, vm.widget, vm.unreadCount)
				.catch(function(err){
					$log.error(err);
					toastr.error("Unable to retrieve items for widget '" +vm.widget.config.title+ "'");
				});
		}
		retrieveData();
		
		$scope.$on('$destroy', function () {
			vm.unreadCount({count: -vm.widget.widgetData.unreadItems});
		});
		
		vm.remove =  function($event) {
			$event.preventDefault();
			vm.onRemove({widgetId: vm.widget.id});
		}
		vm.startEditing =  function($event) {
			$event.preventDefault();
			$log.debug("Start editing widget", vm.widget);
			vm.editedWidget = {
				title: vm.widget.config.title,
				display_count: vm.widget.config.display_count
			};
			vm.editMode = true;
			$log.debug("Start editing widget", vm.editMode);
		}
		vm.editOk =  function() {
			vm.editMode = false;
			$log.debug("Edit OK ", vm.editedWidget);
			var old = {
				title: vm.widget.config.title,
				display_count: vm.widget.config.display_count
			};
			
			vm.widget.config.title = vm.editedWidget.title;
			vm.widget.config.display_count = vm.editedWidget.display_count;
			
			okihomeApi.saveWidgetConfig(vm.tab,vm.widget.id,vm.editedWidget)
				.then(function(){
					toastr.success('Widget configuration saved');
				})
				.catch(function(err){
					toastr.error('Unable to save widget configuration');

					$log.error("saveWidgetConfig failed", err);
					vm.widget.config.title = old.title;
					vm.widget.config.display_count = old.display_count;
				});
		}
		vm.editCancel =  function() {
			vm.editMode = false;
			$log.debug("Edit cancel ", vm.editedWidget);
		}
		vm.markAllRead = function($event) {
			$event.preventDefault();
			$scope.$broadcast('markAllRead');
		}
		vm.refresh = function() {
			retrieveData();
		}

     }
  }
  
  /** @ngInject */
  function okiWidgetContent($compile, widgetRegistry) {
    var directive = {
		restrict: 'E',
		template: '<div><p>Please wait. Data is loading...</p></div>',
		link: WidgetContentLink
    };

    return directive;
	
    function WidgetContentLink(scope, elem, attrs) {
		
		var widgetType = widgetRegistry.get(attrs.widgetType);
		
		var compiledAndLinkedElem =
			$compile('<ng-include src="\''+widgetType.options.templateUrl+'\'" '+
				'ng-controller="'+widgetType.options.controller+'" '+
				'></ng-include>')(scope);
		
		elem.html('').append(compiledAndLinkedElem);
	}
  }

})();
