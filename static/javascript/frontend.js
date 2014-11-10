var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var playingFlag=false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '195',
        width: $('.videolist').width(),
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
}

function onPlayerStateChange(event) {
    if(player.getCurrentTime() === 0){
        timerStartFlag=false;
    }
    if (event.data == YT.PlayerState.ENDED) {
        var $volumeElement = $('.userVideolist li.active');
        var scope = angular.element($volumeElement).scope();
        scope.$apply(function() {
            scope.nextVideo();
        });
    } else if (event.data === YT.PlayerState.PAUSED) {
        if(!$('ul.controllers li:nth-child(2)').hasClass('changing')){
            $el = $('ul.controllers li.fa-pause');
            $el.toggleClass('fa fa-pause');
            $el.toggleClass('fa fa-play');
        }
        pauseTimer();
        timerStartFlag=false;
    } else if (event.data === YT.PlayerState.PLAYING) {
        if(!$('ul.controllers li:nth-child(2)').hasClass('changing')){
            $el = $('ul.controllers li.fa-play');
            $el.toggleClass('fa fa-pause');
            $el.toggleClass('fa fa-play');
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

    $('.looper').looper({});
    $('.looper').looper('next');
    $('.looper').looper('pause');

    $("#addPlaylist").leanModal({
        top: 200,
        overlay: 0.6,
        closeButton: ".modal_close"
    });

    var text = "";
    $('.userVideolist').on('mouseenter', 'span', function() {
        text = $(this).text();
        $(this).text("");
        $(this).append('<i style="color:#e52d4f;" class="fa fa-times"></i>');
        $(this).css("border-left", "2px solid #e52d4f");
    });
    $('.userVideolist').on('mouseleave', 'span', function() {
        $(this).children().remove();
        $(this).text(text);
        $(this).css('border-left', '0');
        text = "";
    });

////////////////////////////////////////////////////////////////////////////////
// VOLUME BAR
////////////////////////////////////////////////////////////////////////////////
    var $volume = $(".volumeBar");
    $volume.slider();
    var $volumeElement = $(".volumeBar span");
    $volumeElement.css('left', 'calc(100% - 5px)');

    var onVolumeClick = false;

    $(".volume i").on('click', function() {
        $(this).toggleClass('fa-volume-up');
        $(this).toggleClass('fa-volume-off');
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
                    $(".volume i").removeClass('fa-volume-up');
                    $(".volume i").removeClass('fa-volume-down');
                    $(".volume i").addClass('fa-volume-off');
                } else if (temp < 50) {
                    $(".volume i").removeClass('fa-volume-up');
                    $(".volume i").addClass('fa-volume-down');
                    $(".volume i").removeClass('fa-volume-off');
                } else if (temp > 50) {
                    $(".volume i").addClass('fa-volume-up');
                    $(".volume i").removeClass('fa-volume-down');
                    $(".volume i").removeClass('fa-volume-off');
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
            duration=parseInt((player.getCurrentTime())/(getMaxVideoTime())*1000)/10;
            if(duration >= 99){
                duration = 99.2;
            }
            $('.player > .time-container > span.time').text(convertSecondsToTime(player.getCurrentTime()+1));
            $(".progressBar div.progressLevel").css('width', duration+'%');
            $(".progressBar span").css('left', duration+'%');
        }
    },250);

    var $progress = $(".progressBar");
    $progress.slider();
    var $progressElement = $(".progressBar span");

    var onProgressClick = false;

    $progress.on('mousedown', function() {
        onProgressClick = true;
        $('ul.controllers li:nth-child(2)').addClass('changing');
        player.pauseVideo();
        var outerWidth = parseInt($volume.css('width'));
        $(document).on('mousemove', function() {
            if (parseInt($progressElement.css('left')) > 341) {
                $progressElement.css('left', '99.2%');
            }
            $(".progressBar div.progressLevel").css('width', parseInt($progressElement.css('left')));
        });
    });
    $(document).on('mouseup', function() {
        if(onProgressClick){
            onProgressClick = false;
            var outerWidth = parseInt($progress.css('width'));
            if (outerWidth !== parseInt(parseInt($progressElement.css('left')) / outerWidth * 100)) {
                $(".progressBar div.progressLevel").css('width', parseInt($progressElement.css('left')));

                var newTime = parseInt(parseInt($progressElement.css('left')) / outerWidth * getMaxVideoTime()*100)/100;
                console.log(newTime);
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
        $('.searchResultColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.youtubeSearchBar').outerHeight()));
        $('.userVideolist').height($(window).height() - ($('.playlistHeader').outerHeight() + $('.player').outerHeight()));
        $('.userPlaylist').height($(this).height() - ($('.topHeader').outerHeight() + $('.youtubeSearchBar').outerHeight() + $('.yourPlaylists').outerHeight() + $('.playlistSearch').outerHeight() + $('.addPlaylist').outerHeight()));
    });
});
////////////////////////////////////////////////////////////////////////////////