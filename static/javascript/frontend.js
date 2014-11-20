var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var playingFlag=false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '240',
        width: $('.playView').width()-6,
        videoId: '',
        playerVars: {
            'showinfo': 0,
            'autohide': 0,
            'controls': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    //event.target.playVideo();
    player.setVolume(100);
}

function onPlayerStateChange(event) {
    if(player.getCurrentTime() === 0){
        timerStartFlag=false;
    }
    if (event.data == YT.PlayerState.ENDED) {
        var scope = angular.element($('.userVideolist')).scope();
        scope.$apply(function() {
            scope.nextVideo();
        });
    } else if (event.data === YT.PlayerState.PAUSED) {
        if(!$('ul.controllers li:nth-child(2)').hasClass('changing')){
            var $el = $('ul.controllers li i.icon-control-pause');
            $el.toggleClass('icon-control-pause');
            $el.toggleClass('icon-control-play');
        }
        pauseTimer();
        timerStartFlag=false;
    } else if (event.data === YT.PlayerState.PLAYING) {
        if(!$('ul.controllers li:nth-child(2)').hasClass('changing')){
            var $el = $('ul.controllers li i.icon-control-play');
            $el.toggleClass('icon-control-pause');
            $el.toggleClass('icon-control-play');
            onTopHeaderChange();
        }
        else{
            $('ul.controllers li:nth-child(2)').removeClass('changing');
        }

        /*if($('.looper .item.active span.status').hasClass('nextStatus')){
            $('.looper').looper('next');
        }*/

        if(!timerStartFlag){
            var timer=null;
            startTimer();
            timerStartFlag=true;
        }
        if(!playingFlag){
            playingFlag=true;
            $('.looper').looper('loop');
        }
    }
}

function onTopHeaderChange() {
    var el = $('.topHeader');
    var scope = angular.element(el).scope();
    scope.$apply(function() {
        scope.changeTopHeader();
    });
}

function onVolumeChange(el, volume) {
    var scope = angular.element(el).scope();
    scope.$apply(function() {
        scope.changeVolume(volume);
    });
}

function onSearchChange(el, query){
    var scope = angular.element(el).scope();
    scope.$apply(function() {
        scope.onSearch(query, function(data){
            $('.lcSearch > input').autocomplete({
                source: data
            });
        });
    });
}

function convertSecondsToTime(s) {
    var tHours = parseInt(s/3600);
    var tMinutes = parseInt((s%3600)/60);
    var tSeconds = parseInt((s%3600)%60);
    var time = "",
        hours = "",
        minutes = "00:",
        seconds = "00";
    if(tHours){
        hours=tHours;
        if(tHours.length === 1){
            hours="0"+hours;
        }
        hours=hours+":";
    }
    if(tMinutes){
        minutes=tMinutes;
        if(tMinutes < 10){
            minutes="0"+minutes;
        }
        minutes=minutes+":";
    }
    if(tSeconds){
        seconds=tSeconds;
        if(tSeconds < 10){
            seconds="0"+seconds;
        }
    }
    return hours + minutes + seconds;
}

var timerStartFlag=false;
var isPaused=true;
var duration=0;

function startTimer() {
    isPaused=false;
}

function pauseTimer(){
    isPaused=true;
}

$(document).ready(function() {

    $('.lcSearch > input').on('input', function() {
        onSearchChange($(this),$(this).val());
    });
    $('.looper').looper({});
    $('.looper').looper('next');
    $('.looper').looper('pause');

    $("#addPlaylist").leanModal({
        top: 200,
        overlay: 0.6,
        closeButton: ".modal_close"
    });

////////////////////////////////////////////////////////////////////////////////
// VOLUME BAR
////////////////////////////////////////////////////////////////////////////////
    var $volume = $(".volumeBar");
    $volume.slider();
    var $volumeElement = $(".volumeBar span");
    $volumeElement.css('left', '100%');

    var onVolumeClick = false;

    var volumeHistory = null;
    var volumeClassHistory = null;
    $(".volume-icon i").on('click', function() {
        if(!volumeClassHistory) volumeClassHistory = $(".volume-icon i").attr('class');
        if($(this).attr('class') !== 'icon-volume-off'){
            $(this).addClass('icon-volume-off');
            $(this).removeClass(volumeClassHistory);
        }
        else if($(this).attr('class') === 'icon-volume-off'){
            $(this).removeClass('icon-volume-off');
            $(this).addClass(volumeClassHistory);
            volumeClassHistory = null;
        }

        // volume is on
        if(!volumeHistory) volumeHistory = parseInt($volumeElement.css('left'));
        if($(this).attr('class') === 'icon-volume-off'){
            console.log('turning volume off ' + volumeHistory);
            $volumeElement.css('left', 0);
            $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
        }
        // volume is off
        else{
            console.log('turning volume on ' + volumeHistory);
            $volumeElement.css('left', volumeHistory);
            $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
            volumeHistory = null;
        }
    });

    $volume.on('mousedown', function() {
        onVolumeClick= true;
        var outerWidth = parseInt($volume.css('width'));
        $(document).on('mousemove', function() {
            if (outerWidth !== parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100)) {
                var temp = parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100);
                onVolumeChange($volumeElement, temp);
                $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
                if (temp == 0) {
                    $(".volume-icon i").removeClass('icon-volume-2');
                    $(".volume-icon i").removeClass('icon-volume-1');
                    $(".volume-icon i").addClass('icon-volume-off');
                } else if (temp < 50) {
                    $(".volume-icon i").removeClass('icon-volume-2');
                    $(".volume-icon i").addClass('icon-volume-1');
                    $(".volume-icon i").removeClass('icon-volume-off');
                } else if (temp > 50) {
                    $(".volume-icon i").addClass('icon-volume-2');
                    $(".volume-icon i").removeClass('icon-volume-1');
                    $(".volume-icon i").removeClass('icon-volume-off');
                }
            }
        });
    });
    $(document).on('mouseup', function() {
        if(onVolumeClick){
            onVolumeClick = false;
            var outerWidth = parseInt($volume.css('width'));
            if (outerWidth !== parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100)) {
                var temp = parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100);
                onVolumeChange($volumeElement, temp);
                $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
            }
        }
    });
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// PROGRESS BAR
////////////////////////////////////////////////////////////////////////////////
    var t = setInterval(function(){
        if(!isPaused){
            duration=(player.getCurrentTime())/(getMaxVideoTime())*100;
            $('.bottomContainer > div.time > span.timeStart').text(convertSecondsToTime(player.getCurrentTime()+1));
            $(".progressBar > div.progressLevel").css('width', duration+'%');
            $(".progressBar > span").css('left', duration+'%');
        }
    },250);

    var $progress = $(".progressBar");
    $progress.slider();
    var $progressElement = $(".progressBar > span");

    var onProgressClick = false;

    $progress.on('mousedown', function() {
        onProgressClick = true;
        $('ul.controllers li:nth-child(2)').addClass('changing');
        player.pauseVideo();
        var outerWidth = parseInt($progress.css('width'));
        $(document).on('mousemove', function() {
            if(onProgressClick) $(".progressBar > div.progressLevel").css('width', parseInt($progressElement.css('left')));
        });
    });
    $(document).on('mouseup', function() {
        if(onProgressClick){
            onProgressClick = false;
            var outerWidth = parseInt($progress.css('width'));
            if (outerWidth !== parseInt($progressElement.css('left')) / outerWidth * 100) {
                $(".progressBar > div.progressLevel").css('width', parseInt($progressElement.css('left')));

                var newTime = parseInt(parseInt($progressElement.css('left')) / outerWidth * getMaxVideoTime()*100)/100;
                player.seekTo(newTime);
                player.playVideo();
            }
        }
    });

    function getMaxVideoTime(){
        return player.getDuration();
    }
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// RESIZE DIVS
////////////////////////////////////////////////////////////////////////////////
    $(window).bind("load resize", function() {
        $('.searchResultColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.lcSearch').outerHeight()));
        $('.userVideolist').height($(window).height() - ($('.playlistHeader').outerHeight() + $('.player').outerHeight()));
        $('.userPlaylist').height($(this).height() - ($('.topHeader').outerHeight() + $('.slSearch').outerHeight() + $('.yourPlaylists').outerHeight() + $('.playlistSearch').outerHeight() + $('.addPlaylist').outerHeight()));
    });
////////////////////////////////////////////////////////////////////////////////

    (function(){
    var $el = $('ul.sortable');
    $('ul.sortable').sortable({
        stop: function(event, ui) {
            var scope = angular.element($el).scope();
            scope.$apply(function() {
                scope.refreshVideoList($el.sortable('toArray'));
            });

        }
    }).disableSelection();})();

    (function(){
        var html = '';
        $('.userVideolist').on('mouseenter', 'li', function(){
            html = $(this).children('span.duration').html();
            $(this).children('span.duration').html('<i class="icon-close"></i>').bind('click', function(e){
                var self = this;
                var scope = angular.element($('.userVideolist')).scope();
                scope.$apply(function() {
                    scope.removeVideo(e, $(self).parent().attr('id'));
                });
            });
        });
        $('.userVideolist').on('mouseleave', 'li', function(){
            $(this).children('span.duration').html(html);
        });
    })();
});
