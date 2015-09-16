/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('appController', AppController);

    AppController.$inject = ['clientService', 'electron', '$sce', 'postMessage', '$document'];

    function AppController(clientService, electron, $sce, postMessage, $document) {
        //send a message to electron
        electron.send("Hello from the client.");
        var self = this,
        //clientService is added in the injector to initiate the service to load
        //the application user-agent classes
            client = clientService.info;
        
    };

})(window.angular);
