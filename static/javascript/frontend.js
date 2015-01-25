var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player = null;
var playerPreview = null;
var timerStartFlag=false;
var isPaused=true;
var duration=0;
var previewPlayerState = -1;


Pace.on("done", function(){
    setTimeout(function(){
        $('div.loading-page').fadeOut(1000);
    },200);
});

function initiateYoutubePlayers(){
    var params = { allowScriptAccess: "always" };
    var atts2 = { id: "myytplayer" ,
            'showinfo': 0,
            'autohide': 0,
            'controls': 1,
            'modestbranding': 1,
            wmode: 'transparent'};
    swfobject.embedSWF("http://www.youtube.com/v/Oi1BcouEmio?enablejsapi=1&playerapiid=player&version=3&showinfo=0&autohide=0&controls=0", "player", "100%", "100%", "8", null, null, params, atts2);

}

function onYouTubePlayerReady(event) {
    player = document.getElementById("myytplayer");
    player.addEventListener("onReady", "onPlayerReady");
    player.addEventListener("onStateChange", "onPlayerStateChange");
}
function onPlayerReady(event) {
    //event.target.playVideo();
    player.setVolume(100);
}

function onPlayerStateChange(event) {
    if(player.getCurrentTime() === 0){
        timerStartFlag=false;
    }
    if (event == YT.PlayerState.ENDED) {
        var scope = angular.element($('.userVideolist')).scope();
        scope.$apply(function() {
            scope.nextVideo('ended');
        });
    } else if (event === YT.PlayerState.PAUSED) {
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
    } else if (event === YT.PlayerState.PLAYING) {
        if(!$('.videolist .player .overlay').hasClass('fade-out')){
            $('.videolist .player .overlay').addClass('fade-out');
            setTimeout(function(){
                $('.videolist .player .overlay').addClass('hide');
            },1500)
        }
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
function setSize(width, height, animate){
    if(animate){
        $('.player').animate({
            'width' : width,
            'height' : height
        },500);
    }
    else{
        $('.player').css('width', width);
        $('.player').css('height', height);
    }
}
function onVolumeChange(el, volume) {
    var scope = angular.element(el).scope();
    scope.$apply(function() {
        scope.changeVolume(volume);
    });
}

function onSearchChange(el, query){
    console.log(query);
    if(query){
        var scope = angular.element(el).scope();
        scope.$apply(function() {
            scope.onSearch(query, function(data){
                console.log(data);
                $('.lcSearch > input').autocomplete({
                    source: data,
                    select:function(event, ui){
                        scope.queryYoutube({},ui.item.value);
                    }
                });
            });
        });
    }
}

function onPreviewClick(self){
    $('#videoPreview').click();

    var params = { allowScriptAccess: "always" };
    var atts = { id: "myytplayerpreview" ,
            'showinfo': 0,
            'controls': 1,
            'modestbranding': 1,
            wmode: 'transparent'};
    swfobject.embedSWF("http://www.youtube.com/v/"+$(self).attr('id')+"?enablejsapi=1&playerapiid=playerPreview&version=3&showinfo=0&autoplay=1&autohide=1&controls=1", "playerPreview", "550", "310", "8", null, null, params, atts);

    previewPlayerState = player.getPlayerState();
    player.pauseVideo();
}

function removeCloseIcon(el) {
    $(el).children('.duration').removeClass('hide');
    $(el).children('.close').addClass('hide');
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
    initiateYoutubePlayers();

    $('.lcSearch > input').autocomplete({appendTo: "body"});
    $('.lcSearch > input').autocomplete('enable');

    alertify.set('notifier','position', 'top-right');
    alertify.set('notifier','delay', 3);

    $('.lcSearch > input').on('keyup', function(e) {
        var self = this;
        if(e.which !== 13){
            onSearchChange($(self),$(self).val());
        }
        else if(e.which === 13){
            console.log("hey");
            $('.lcSearch > input').autocomplete( "destroy" );
            setTimeout(function(){
                $('.lcSearch > input').autocomplete({appendTo: "body"});
                $('.lcSearch > input').autocomplete('enable');
            },1000);
        }
    });

    $("#videoPreview").leanModal({
        top: 50,
        overlay: 0.6,
        closeButton: ".modal_close i"
    });

    setSize(310, 550, false); // HACK

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
            $volumeElement.css('left', 0);
            $(".volumeBar div.volumeLevel").css('width', parseInt($volumeElement.css('left')));
             onVolumeChange($volumeElement,0);
        }
        // volume is off
        else{
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
        });
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
        }
    },250);

    var $progress = $(".progressBar");
    $progress.slider();
    var $progressElement = $(".progressBar > span");
    var onProgressClick = false;

    $progress.on('mousedown', function() {
        if($('.overlay').hasClass('fade-out')){
            onProgressClick = true;
            $('ul.controllers li:nth-child(2)').addClass('changing');
            player.pauseVideo();
            var outerWidth = parseInt($progress.css('width'));
            $(document).on('mousemove', function() {
                if(onProgressClick) $(".progressBar > div.progressLevel").css('width', parseInt($progressElement.css('left')));
            });
            $(document).on('mouseup', function() {
                if(onProgressClick){
                    onProgressClick = false;
                    var outerWidth = parseInt($progress.css('width'));
                    $(".progressBar > div.progressLevel").animate({
                        'width': parseInt($progressElement.css('left'))
                    }, 400,function(){
                        var newTime = parseInt(parseInt($progressElement.css('left')) / outerWidth * getMaxVideoTime()*100)/100;
                        player.seekTo(newTime);
                        player.playVideo();
                    });
                }
            });
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
        setSize($('.videolist').width(), '310');
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
    var $el = $('ul.userVideolist.sortable');
    $('ul.userVideolist.sortable').sortable({
        stop: function(event, ui) {
            var scope = angular.element($el).scope();
            scope.$apply(function() {
                scope.updateVideoList($el.sortable('toArray'));
            });

        }
    }).disableSelection();}());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// SORTING PLAYLIST
////////////////////////////////////////////////////////////////////////////////
    (function(){
    var $el = $('ul.userPlaylist.sortable');
    $('ul.userPlaylist.sortable').sortable({
        stop: function(event, ui) {
            var scope = angular.element($el).scope();
            scope.$apply(function() {
                scope.updatePlaylist($el.sortable('toArray'));
            });

        }
    }).disableSelection();}());

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// VIDEOLIST REMOVE FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $('.userVideolist').on('mouseenter', 'li', function(){
            $(this).children('.duration').addClass('hide');
            $(this).children('.close').removeClass('hide');
            $('.userVideolist').on('mouseleave', 'li', function(){
                $(this).children('.duration').removeClass('hide');
                $(this).children('.close').addClass('hide');
            });
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// USERPLAYLIST OPTIONS FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $('.userPlaylist').on('mouseenter', 'li', function(){
            $(this).children('.playlistDetail').children('.globalSummary').addClass('hide');
            $(this).children('.playlistDetail').children('.playlistOptions').removeClass('hide');
            console.log($(this).children('.playlistOptions').attr('class'));
            $('.userPlaylist').on('mouseleave', 'li', function(){
                $(this).children('.playlistDetail').children('.globalSummary').removeClass('hide');
                $(this).children('.playlistDetail').children('.playlistOptions').addClass('hide');
            });
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
        $('.full-screen-icon > i').on('click', function(){
            if($('.overlay').hasClass('fade-out')){
                if(!$('#QubePlaylist .videolist .player').hasClass('fullscreen')){
                    $('.bottomContainer .full-screen-icon > i').removeClass('icon-size-fullscreen');
                    $('.bottomContainer .full-screen-icon > i').addClass('icon-size-actual');
                    $('#QubePlaylist .videolist .player').addClass('fullscreen');
                    setSize($('#QubePlaylist').width(), $('#QubePlaylist').height()-120, true);
                }
                else{
                    width = $('.playView').width();
                    $('.bottomContainer .full-screen-icon > i').addClass('icon-size-fullscreen');
                    $('.bottomContainer .full-screen-icon > i').removeClass('icon-size-actual');
                    $('#QubePlaylist .videolist .player').removeClass('fullscreen');
                    setSize(width, height, true);
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
            $('.addPlaylistModalBody').html("<div id='playerPreview'></div>");
            if(previewPlayerState === 1){
                player.playVideo();
            }
        });
        $('#lean_overlay').on('click', function(){
            $('.addPlaylistModalBody').html("<div id='playerPreview'></div>");
            if(previewPlayerState === 1){
                player.playVideo();
            }
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// KEYPRESS FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    (function(){
        $(window).keypress(function(e) {
            if ((e.keyCode == 0 || e.keyCode == 32) && !$('input').is(":focus") && !$('object').is(":focus") && !$('#addPlaylistModal').is(":visible")) {
                var self = this;
                var scope = angular.element($('.playView')).scope();
                scope.$apply(function() {
                    scope.togglePlayVideo();
                });
                e.preventDefault();
            }
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// INPUT DISPLAY FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////

    (function(){
        $('.lcSearch').on('mouseenter',function(){
            $('.lcSearch > input').addClass('fade-in-lt');
            $('.lcSearch > input').removeClass('fade-out-lt');
        });
        $('.lcSearch').on('mouseleave',function(){
            if(!$('.ui-autocomplete').is(':visible') && !$('.lcSearch input').is(":focus")){
                $('.lcSearch > input').blur();
                $('.lcSearch > input').removeClass('fade-in-lt');
                $('.lcSearch > input').addClass('fade-out-lt');
            }
        });
        $('.lcSearch > input').on('blur',function(){
            $('.lcSearch > input').removeClass('fade-in-lt');
            $('.lcSearch > input').addClass('fade-out-lt');
        });

        $('.lcPlaylist').on('mouseenter',function(){
            $('.lcPlaylist > input').addClass('fade-in-lt');
            $('.lcPlaylist > input').removeClass('fade-out-lt');
        });
        $('.lcPlaylist').on('mouseleave',function(){
            if(!$('.ui-autocomplete').is(':visible') && !$('.lcPlaylist input').is(":focus")){
                $('.lcPlaylist > input').blur();
                $('.lcPlaylist > input').removeClass('fade-in-lt');
                $('.lcPlaylist > input').addClass('fade-out-lt');
            }
        });
        $('.lcPlaylist > input').on('blur',function(){
            $('.lcPlaylist > input').removeClass('fade-in-lt');
            $('.lcPlaylist > input').addClass('fade-out-lt');
        });

        $('.lcPlaylistAdd').on('mouseenter',function(){
            $('.lcPlaylistAdd > input').addClass('fade-in-lt');
            $('.lcPlaylistAdd > input').removeClass('fade-out-lt');
            $('.lcPlaylistAdd > a').addClass('fade-in-lt');
            $('.lcPlaylistAdd > a').removeClass('fade-out-lt');
        });
        $('.lcPlaylistAdd').on('mouseleave',function(){
            if(!$('.ui-autocomplete').is(':visible') && !$('.lcPlaylistAdd input').is(":focus")){
                $('.lcPlaylistAdd > input').blur();
                $('.lcPlaylistAdd > input').removeClass('fade-in-lt');
                $('.lcPlaylistAdd > input').addClass('fade-out-lt');
                $('.lcPlaylistAdd > a').removeClass('fade-in-lt');
                $('.lcPlaylistAdd > a').addClass('fade-out-lt');
            }
        });
        $('.lcPlaylistAdd > input').on('blur',function(){
            $('.lcPlaylistAdd > input').removeClass('fade-in-lt');
            $('.lcPlaylistAdd > input').addClass('fade-out-lt');
            $('.lcPlaylistAdd > a').removeClass('fade-in-lt');
            $('.lcPlaylistAdd > a').addClass('fade-out-lt');
        });
    }());
////////////////////////////////////////////////////////////////////////////////

    (function(){
        function transformToGlobal(){
            $('.globalView').toggleClass('hide');
            $('.view.main').toggleClass('hide');
            $('#QubePlaylist').toggleClass('global');
            var scope = angular.element($('.userVideolist')).scope();
            scope.$apply(function() {
              scope.loadFirstPlaylist();
            });
        }

        $('.logo').on('click', function(){
            transformToGlobal();
            $(window).resize();
        });
    }());
});
