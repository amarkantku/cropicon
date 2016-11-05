(function(window, angular){
	'use strict';
	var iDirective = angular.module('iDirective',[]);

	iDirective.directive('displayTime',['$parse', function($parse) {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            template: '<span class="currentTime"></span>',
            link: function (scope, element, attrs, controller) {
                var currentDate = new Date();
                element.text(currentDate.toTimeString());
            }
        }
    }]);


    iDirective.directive('clock',['$interval', function($interval) {
        return {
            restrict: "E",
            scope: true,
            transclude: true, 
            template: "<span class='clock'><span class='clock-text' ng-transclude></span><span class='clock-time'>{{date.now() | date: 'medium'}}</span></span>",
            link: function ($s, $e, $a) {
                var clockTick = function() {
                    $s.date = Date;
                }
                clockTick();
                $interval(clockTick, 1000);
            }
        }
    }]);    
})(window, window.angular);