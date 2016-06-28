(function() {
  'use strict';

  angular
    .module('okihome')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
