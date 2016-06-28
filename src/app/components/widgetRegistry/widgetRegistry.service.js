(function() {
  'use strict';

  angular
    .module('okihome')
    .provider('widgetRegistry', widgetRegistry);
	
  function WidgetType(options) {
	this.options = options;
  }
  
  WidgetType.prototype.allowMarkAllRead = function() {
	return this.options.allowMarkAllRead;
  };
  
  /** @ngInject */
  function widgetRegistry() {
	
	var registry = {};
	
	this.$get = function() {
		
		var service = {
			register: register,
			unregister: unregister,
			get: get
		};
		
		return service;
	};
	
    function get(widgetType) {
		return registry[widgetType];
    }
	
    function register(widgetType, widgetOptions) {
		if(registry[widgetType]){
			console.log("Widget type already registered: " + widgetType);
		}
		return registry[widgetType] = new WidgetType(widgetOptions);
    }
	this.register = register;
	
    function unregister(widgetType) {
		delete registry[widgetType];
    }
  }
})();
