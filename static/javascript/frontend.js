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
        $el = $('ul.controllers li.fa-pause');
        $el.toggleClass('fa fa-pause');
        $el.toggleClass('fa fa-play');
        pauseTimer();
        timerStartFlag=false;
    } else if (event.data === YT.PlayerState.PLAYING) {
        $el = $('ul.controllers li.fa-play');
        $el.toggleClass('fa fa-pause');
        $el.toggleClass('fa fa-play');

        onTopHeaderChange();

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
var maxTime;
var duration=0;

function startTimer() {
    isPaused=false;
    maxTime = player.getDuration();
}

function pauseTimer(){
    isPaused=true;
}

$(document).ready(function() {

    $('.looper').looper({});
    $('.looper').looper('next');
    $('.looper').looper('pause');
    var t = setInterval(function(){
        if(!isPaused){
            duration=parseInt((player.getCurrentTime())/(maxTime)*1000)/10;
            if(duration >= 99){
                duration = 99.2;
            }
            $('.player > .time-container > span.time').text(convertSecondsToTime(player.getCurrentTime()+1));
            $(".progressBar div.progressLevel").css('width', duration+'%');
            $(".progressBar span").css('left', duration+'%');
        }
    },250);

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

    $(".volumeBar").slider();
    var $volume = $(".volumeBar");
    var $volumeElement = $(".volumeBar span");
    $volumeElement.css('left', 'calc(100% - 5px)');

    $(".progressBar").slider();
    var $progress = $(".progressBar");
    var $progressElement = $(".progressBar span");

    $(".volume i").on('click', function() {
        $(this).toggleClass('fa-volume-up');
        $(this).toggleClass('fa-volume-off');
    });

    $progress.on('mousedown', function() {
        $(document).on('mousemove', function() {
            if (parseInt($progressElement.css('left')) > 341) {
                $progressElement.css('left', '99.2%');
            }
        });
    });
    $volume.on('mousedown', function() {
        var outerWidth = parseInt($('.volumeBar').css('width'));
        var prev = outerWidth;
        $(document).on('mousemove', function() {
            if (prev !== parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100)) {
                prev = parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100);
                onVolumeChange($volumeElement, prev);
                $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
                if (prev == 0) {
                    $(".volume i").removeClass('fa-volume-up');
                    $(".volume i").removeClass('fa-volume-down');
                    $(".volume i").addClass('fa-volume-off');
                } else if (prev < 50) {
                    $(".volume i").removeClass('fa-volume-up');
                    $(".volume i").addClass('fa-volume-down');
                    $(".volume i").removeClass('fa-volume-off');
                } else if (prev > 50) {
                    $(".volume i").addClass('fa-volume-up');
                    $(".volume i").removeClass('fa-volume-down');
                    $(".volume i").removeClass('fa-volume-off');
                }
            }
        });
    });
    $(document).on('mouseup', function() {
        var outerWidth = parseInt($('.volumeBar').css('width'));
        var prev = outerWidth;
        if (prev !== parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100)) {
            prev = parseInt(parseInt($volumeElement.css('left')) / outerWidth * 100);
            onVolumeChange($volumeElement, prev);
            $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
        }
    });

    $(window).bind("load resize", function() {
        $('.searchResultColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.youtubeSearchBar').outerHeight()));
        $('.userVideolist').height($(window).height() - ($('.playlistHeader').outerHeight() + $('.player').outerHeight()));
        $('.userPlaylist').height($(this).height() - ($('.topHeader').outerHeight() + $('.youtubeSearchBar').outerHeight() + $('.yourPlaylists').outerHeight() + $('.playlistSearch').outerHeight() + $('.addPlaylist').outerHeight()));
    });
});