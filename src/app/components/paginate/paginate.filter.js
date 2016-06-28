(function() {
  'use strict';

  angular
    .module('okihome')
		.filter('paginate', paginate)
			
	/** @ngInject */
	function paginate() {
		return function(array, pageNumber, itemsPerPage){
			pageNumber = pageNumber || 1;
			itemsPerPage = itemsPerPage || 5;
			var begin = ((pageNumber - 1) * itemsPerPage);
			var end = begin + itemsPerPage;
			return array.slice(begin, end);
		};
	}
})();