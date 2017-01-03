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

    iDirective.directive('myYoutube', function($sce) {
        return {
            restrict: 'EA',
            scope: { code:'=' },
            replace: true,
            template: '<div style="height:400px;"><iframe style="overflow:hidden;height:100%;width:100%" width="100%" height="100%" src="{{url}}" frameborder="0" allowfullscreen></iframe></div>',
            link: function (scope) {
                scope.$watch('code', function (newVal) {
                    console.log('here '+newVal);
                    if (newVal) {
                        scope.url = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + newVal);
                    }
                });
            }
        };
    });

})(window, window.angular);