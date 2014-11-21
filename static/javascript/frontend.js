var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var playerPreview;
var timerStartFlag=false;
var isPaused=true;
var duration=0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '310',
        width: $('.playView').width(),
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

    playerPreview = new YT.Player('playerPreview', {
        height: '310',
        width: $('.playView').width(),
        videoId: '',
        playerVars: {
            'showinfo': 0,
            'autohide': 0,
            'controls': 1,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReadyPreview
        }
    });
}

function onPlayerReady(event) {
    //event.target.playVideo();
    player.setVolume(100);
}
function onPlayerReadyPreview(event) {
    playerPreview.setVolume(100);
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
            $el.removeClass('icon-control-pause');
            $el.addClass('icon-control-play');
            $('.bar1.a3').removeClass('animate');
            $('.bar2.a5').removeClass('animate');
            $('.bar3.a1').removeClass('animate');
            $('.bar4.a4').removeClass('animate');
            $('.bar5.a2').removeClass('animate');
        }
        else{
            $('ul.controllers li:nth-child(2)').removeClass('changing');
        }
        pauseTimer();
        timerStartFlag=false;
    } else if (event.data === YT.PlayerState.PLAYING) {
        if(!$('.videolist .player .overlay').hasClass('fade-out')) $('.videolist .player .overlay').addClass('fade-out');
        if(!$('ul.controllers li:nth-child(2)').hasClass('changing')){
            var $el = $('ul.controllers li i.icon-control-play');
            $el.addClass('icon-control-pause');
            $el.removeClass('icon-control-play');
            $('.bar1.a3').addClass('animate');
            $('.bar2.a5').addClass('animate');
            $('.bar3.a1').addClass('animate');
            $('.bar4.a4').addClass('animate');
            $('.bar5.a2').addClass('animate');
        }
        else{
            $('ul.controllers li:nth-child(2)').removeClass('changing');
        }

        if(!timerStartFlag){
            var timer=null;
            startTimer();
            timerStartFlag=true;
        }
    }
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

function onPreviewClick(self){
    $('#videoPreview').click();
    playerPreview.loadVideoById($(self).attr('id'));
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

    $("#videoPreview").leanModal({
        top: 50,
        overlay: 0.6,
        closeButton: ".modal_close i"
    });

////////////////////////////////////////////////////////////////////////////////
// VOLUME BAR
////////////////////////////////////////////////////////////////////////////////
    var $volume = $(".volumeBar");
    $volume.slider();
    var $volumeElement = $(".volumeBar >span");
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
             onVolumeChange($volumeElement,0);
        }
        // volume is off
        else{
            console.log('turning volume on ' + volumeHistory);
            $volumeElement.css('left', volumeHistory);
            $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
             onVolumeChange($volumeElement,volumeHistory);
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
        if($('#QubePlaylist .videolist .player').hasClass('fullscreen')){
            $('.bottomContainer .full-screen-icon > i').addClass('icon-size-fullscreen');
            $('.bottomContainer .full-screen-icon > i').removeClass('icon-size-actual');
            $('#QubePlaylist .videolist .player').removeClass('fullscreen');
        }
        player.setSize($('.playView').width(), '310');
        $('.listControl').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight()));
        $('.searchResultColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight()));
        $('.userVideolist').height($(window).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.player').outerHeight()));
        $('.userVideolist > div').height($(window).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.player').outerHeight()));
        $('.userPlaylist').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.yourPlaylists').outerHeight()));
    });
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// SORTING VIDEOLIST
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
    }).disableSelection();}());

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// VIDEOLIST REMOVE FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
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
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// OVERLAY FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $('#QubePlaylist .videolist .overlay > div').width($('.playView').width());

        $('#QubePlaylist .videolist').on('click', '.overlay', function(){
            var self = this;
            var scope = angular.element($(this)).scope();
            scope.$apply(function() {
                scope.togglePlayVideo();
            });
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// FULLSCREEN FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        var width = $('.playView').width();

        var height = '310';
        console.log(height);
        console.log(width);
        $('.full-screen-icon > i').on('click', function(){
            if($('.overlay').hasClass('fade-out')){
                if(!$('#QubePlaylist .videolist .player').hasClass('fullscreen')){
                    $('.bottomContainer .full-screen-icon > i').removeClass('icon-size-fullscreen');
                    $('.bottomContainer .full-screen-icon > i').addClass('icon-size-actual');
                    $('#QubePlaylist .videolist .player').addClass('fullscreen');
                    player.setSize($('#QubePlaylist').width(), $('#QubePlaylist').height()-60);
                }
                else{
                    width = $('.playView').width();
                    $('.bottomContainer .full-screen-icon > i').addClass('icon-size-fullscreen');
                    $('.bottomContainer .full-screen-icon > i').removeClass('icon-size-actual');
                    $('#QubePlaylist .videolist .player').removeClass('fullscreen');
                    player.setSize(width, height);
                }
            } else {
                // ensure change happened
                width = $('.playView').width();
            }
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// PREVIEW FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $('.modal_close i').on('click', function(){
            playerPreview.stopVideo();
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// KEYPRESS FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $(window).keypress(function(e) {
            if (e.keyCode == 0 || e.keyCode == 32) {
                if(isPaused){
                    player.playVideo();
                }
                else{
                    player.pauseVideo();
                }
            }
        });
    }());
////////////////////////////////////////////////////////////////////////////////
});
