(function(window, angular){
    'use strict';
    var iFilter = angular.module('iFilter',[]);

    iFilter.filter('trusted', ['$sce', function ($sce) {
        return function(url) {
            var video_id = url.split('v=')[1].split('&')[0];
            return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + video_id);
        };
    }]);

})(window, window.angular);