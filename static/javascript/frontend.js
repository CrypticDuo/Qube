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

// SHARE LINK
new Clipboard('.copyShareLink');

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        playerVars: { controls:0, playsinline:1, rel:0, showinfo:0, modestbranding:0, iv_load_policy:3, fs:0, enablejsapi: 1, disablekb:1 },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });

    playerPreview = new YT.Player('playerPreview', {
        height: '310',
        width: '100%',
        playerVars: { controls:1, playsinline:1, rel:0, showinfo:0, modestbranding:0, iv_load_policy:3, fs:0, enablejsapi: 1, disablekb:1 },
      events: {}
    });
  }

function onPlayerReady(event) {
    player.setVolume(100);
}

function onPlayerStateChange(event) {
    if(player.getCurrentTime() === 0){
        timerStartFlag=false;
    }
    if (event.data === YT.PlayerState.ENDED && player.getCurrentTime() !== 0) {
        var scope = angular.element($('.userVideolist')).scope();
        scope.$apply(function() {
            scope.nextVideo('ended');
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
        },200);
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
    if(query){
        var scope = angular.element(el).scope();
        scope.$apply(function() {
            scope.onSearch(query, function(data){
                $('.lcSearch input').autocomplete({
                    source: data,
                    select:function(event, ui){
                        scope.queryYoutube({},ui.item.value);
                    }
                });
            });
        });
    }
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

    $('.lcSearch input').autocomplete({source: [], appendTo: "body"});
    $('.lcSearch input').autocomplete('enable');

    alertify.set('notifier','position', 'top-right');
    alertify.set('notifier','delay', 3);

    $('.lcSearch input').on('keypress', function(e) {
        var self = this;
        if(e.which !== 13){
            onSearchChange($(self),$(self).val());
        }
        else if(e.which === 13){
            $('.lcSearch input').autocomplete( "destroy" );
            setTimeout(function(){
                $('.lcSearch input').autocomplete({source: [], appendTo: "body"});
                $('.lcSearch input').autocomplete('enable');
            },1000);
        }
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
            $('.progressBar > div.progressLevel').css('width', duration+'%');
            $('.progressBar > span.ui-slider-handle').css('left', duration+'%');
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
            $('.bottomContainer .full-screen-icon').removeClass('active');
            $('#QubePlaylist .videolist .player').removeClass('fullscreen');
        }
        setSize($('.videolist').width(), '310');
        $('.listControl').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight()));
        $('.playlistColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight()));
        $('.searchResultColumn').height($(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight()));
        $('.userVideolist').height($(window).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.player').outerHeight()));
        $('.userVideolist > div').height($(window).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.player').outerHeight()));
        $('.userPlaylist').css('min-height', $(this).height() - ($('.topHeader').outerHeight() + $('.bottomContainer').outerHeight() + $('.addPlaylist').outerHeight()) + 'px');
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
        }).disableSelection();
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// SORTING PLAYLIST
////////////////////////////////////////////////////////////////////////////////
    (function(){
    var $el = $('ul.userPlaylist.sortable');
    $el.sortable({
        stop: function(event, ui) {
            var scope = angular.element($el).scope();
            scope.$apply(function() {
                var names = $('ul.userPlaylist > li .edit .text')
                  .toArray()
                  .map(function(el) { return $(el).text().trim(); });
                scope.updatePlaylist(names);
            });

        }
    }).disableSelection();}());

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
    function fullscreenOn() {
        $('.bottomContainer .full-screen-icon').addClass('active');
        $('#QubePlaylist .videolist .player').addClass('fullscreen');
        setSize($('#QubePlaylist').width(), $('#QubePlaylist').height()-100, true);
    }

    function fullscreenOff(width, height) {
        $('.bottomContainer .full-screen-icon').removeClass('active');
        $('#QubePlaylist .videolist .player').removeClass('fullscreen');
        setSize(width, height, true);
    }
    (function(){
        var width = $('.playView').width();

        $(window).on('keyup', function(e) {
            if (e.which === 27 && $('#QubePlaylist .videolist .player').hasClass('fullscreen')) {
                width = $('.playView').width();
                fullscreenOff(width, height);
            }
        });

        var height = '310';
        $('.full-screen-icon i').on('click', function() {
            if ($('.overlay').hasClass('fade-out')) {
                if (!$('#QubePlaylist .videolist .player').hasClass('fullscreen')) {
                    fullscreenOn();
                }
                else {
                    width = $('.playView').width();
                    fullscreenOff(width, height);
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
            $('#previewOverlay').hide();
            $('#addPlaylistModal').hide();
            playerPreview.stopVideo();
            if(previewPlayerState === 1){
                player.playVideo();
            }
            playerPreview.loadVideoById('');
        });
        $('#previewOverlay').on('click', function(){
            $('#previewOverlay').hide();
            $('#addPlaylistModal').hide();
            playerPreview.stopVideo();
            if(previewPlayerState === 1){
                player.playVideo();
            }
            playerPreview.loadVideoById('');
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
        $(document).on('click', '.lcNavigatable', function(){
          if($(this).hasClass('lcPlaylistAdd') || $(this).hasClass('playingPlaylistName')) {
            $('.listControl').find('.selected').removeClass('selected');
            $('.lcPlaylist').addClass('selected');
          } else {
            $('.listControl').find('.selected').removeClass('selected');
            $(this).addClass('selected');
          }
        });

    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// ADD TO PLAYLIST FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    function getOpenedOptionIndex(elements) {
        var openedOptionIndex = -1;
        for(var i = 0; i < elements.length; i++) {
            if($(elements[i]).css('display') !== 'none') {
              openedOptionIndex = i;
              break;
            }
        }
        return openedOptionIndex;
    }

    (function(){
        $(document).on('click', '.addVideo', function(e) {
            $(e.target).parents('.video').addClass('addingToPlaylist');
            var elements = $('.video .sf-menu-sub');
            var dropdown = $(e.target).parent().find(".sf-menu-sub");

            var openedOptionIndex = getOpenedOptionIndex(elements);

            if(openedOptionIndex !== -1) {
                $(elements[openedOptionIndex]).hide();
                $(elements[openedOptionIndex]).parents('.video').removeClass('addingToPlaylist');
            }
            if($(e.target).parents('.video').index() !== openedOptionIndex) {
              dropdown.toggle();
            }
        });
    }());

////////////////////////////////////////////////////////////////////////////////

$(document).on('click', function(e) {
    if($(e.target).hasClass('addVideo') || $(e.target).hasClass('morePlaylistOptions')) {
        return;
    }
     var listOfMenu = $('.sf-menu-sub');
     for(var i = 0; i < listOfMenu.length; i++) {
        if($(listOfMenu[i]).css('display') !== 'none') {
            $(listOfMenu[i]).hide();
            $(listOfMenu[i]).parents('.video').removeClass('addingToPlaylist');
            $(listOfMenu[i]).parents('.userPlaylist li').removeClass('moreOptionOpen');
            break;
        }
    }
});

////////////////////////////////////////////////////////////////////////////////
// PLAYLIST MORE OPTIONS FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    function handleMorePlaylistOptions(self, e, elements) {
        $(e.target).parents('.userPlaylist li').addClass('moreOptionOpen');
        var dropdown = $(e.target).parent().find('.dropdown');
        var openedOptionIndex = getOpenedOptionIndex(elements);

        if(openedOptionIndex !== -1) {
            $(elements[openedOptionIndex]).hide();
            $(elements[openedOptionIndex]).parents('.userPlaylist li').removeClass('moreOptionOpen');
        }

        // if dropdown goes further below the max height, show it above
        if($(self).parents('.userPlaylist li').index() >= elements.length - 1
          && ((elements.length + 1) * $('.addPlaylist').outerHeight() + (dropdown.outerHeight()/2) >
            $('.listDisplay').outerHeight())) {
            dropdown.css('top', '-95px');
        }

        if($(e.target).parents('.userPlaylist li').index() !== openedOptionIndex) {
            dropdown.toggle();
        }
    }

    (function(){
        $(document).on('click', '.userPlaylists .playlistDetail .morePlaylistOptions', function(e){
            var elements = $('.userPlaylists .playlistDetail .dropdown');
            handleMorePlaylistOptions(this, e, elements);
        });
        $(document).on('click', '.trendingPlaylists .playlistDetail .morePlaylistOptions', function(e){
            var elements = $('.trendingPlaylists .playlistDetail .dropdown');
            handleMorePlaylistOptions(this, e, elements);
        });
    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// ADD PLAYLIST NAME FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    function addPlaylist(inputEl, textEl) {
      var scope = angular.element(inputEl).scope();
      scope.$apply(function() {
          var value = inputEl.val();
          var promise = scope.addPlaylist(value);

          if(!promise) return;

          promise.then(function(result) {
            inputEl.val('');
            inputEl.parents('.addPlaylist').removeClass('editing');
            textEl.show();
            inputEl.hide();
          });
      });
    }
    (function(){
        $(document).on('click', '.addPlaylist', function(e){
            var el = $(this);
            var elements = $('.playlistDetail .edit input.edit-input');
            for(var i = 0; i < elements.length; i++) {
                if($(elements[i]).css('display') !== 'none') {
                    if(i === 0) {
                      break;
                    }
                    hideEditingPlaylist($(elements[i]));
                }
            }

            el.addClass('editing');
            el.find('.text').hide();
            el.find('input').show();
            el.find('input').focus().val(el.find('input').val());
        });
        $(document).on('click', '.addPlaylist .icon-plus', function(e){
            var el = $(this);
            var inputEl = el.parents('.addPlaylist').find('input');
            var textEl = el.parents('.addPlaylist').find('.text');
            if(el.parents('.addPlaylist').hasClass('editing')
              && inputEl.val().length > 0) {
                addPlaylist(inputEl, textEl);
            }
        });
        $(document).on('keypress', '.addPlaylist .playlistDetail .edit input.edit-input', function(e){
            if(e.keyCode == 13) {
              var el = $(this);
              var textEl = el.parent().find('.text');
              addPlaylist(el, textEl);
            }
        });

    }());
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// EDIT PLAYLIST NAME FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    function hideEditingPlaylist(inputEl) {
        var textEl = inputEl.parent().find('.text');
        var isEditingAddPlaylist = inputEl.parents('.addPlaylist').length === 1;
        if(isEditingAddPlaylist) {
            textEl.parents('.addPlaylist').removeClass('editing');
        } else {
            textEl.parent().removeClass('editing');
        }

        inputEl.hide();
        textEl.show();
        if(!isEditingAddPlaylist) {
            inputEl.val(textEl.text());
        } else {
            inputEl.val('');
        }
    }

    function resetEditingInput() {
        var elements = $('.playlistDetail .edit input.edit-input');
        for(var i = 0; i < elements.length; i++) {
          if($(elements[i]).css('display') !== 'none') {
            hideEditingPlaylist($(elements[i]));
            break;
          }
        }
    }

    (function(){
        $(document).on('click', '.editPlaylist', function(e){
            var el = $(this).parents('.userPlaylist li');

            el.find('.edit').addClass('editing');
            el.find('.text').hide();
            el.find('input').width(el.find('.text').css('width'));
            el.find('input').show();
            el.find('input').focus().val(el.find('input').val());
        });
        $(document).on('keypress', '.playlist .playlistDetail .edit input.edit-input', function(e){
            if(e.keyCode == 13) {
              var el = $(this);
              var scope = angular.element(el).scope();
              var textEl = el.parent().find('.text');
              scope.$apply(function() {
                  var value = $(e.target).val();
                  var playlistIndex = $(e.target).parents('li').index();

                  var promise = scope.editPlaylistName(value, playlistIndex);

                  if(!promise) return;

                  promise.then(function(result) {
                    if(result) {
                      textEl.text(el.val());
                    }
                    el.parent().removeClass('editing');
                    textEl.show();
                    el.hide();
                  });
              });
            }
        });
        $(window).on('keyup', function(e) {
            if(e.keyCode === 27 && $('.editing').length > 0) {
                resetEditingInput();
            }
        });
        $(document).on('click', function(e) {
            if($(e.target).hasClass('editPlaylist')
              || $(e.target).hasClass('edit-input')
              || $(e.target).parents('.addPlaylist').length === 1
              || $(e.target).hasClass('addPlaylist')) {
                return;
            }
            resetEditingInput();
      });
    }());
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// NEW FEATURE INFO FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////
    function closeNewFeatureModal() {
        var width = $('body').width();
        var height = $(document).height() - $('.bottomContainer').height();
        $('.new-feature').animate({
          top: height,
          left: '100%',
          width: 0,
          height: 0
        }, 250, 'linear', function() {
            $('.new-feature').hide();
        });
        $('.new-feature .left i').addClass('off');
    }

    (function(){
        $(window).on('keyup', function(e) {
            if(e.keyCode === 27 && $('.new-feature').css('display') !== 'none') {
              closeNewFeatureModal();
              feature_index = 0;
            }
        })

        $(document).on('click', '.new-feature .close', function(e) {
            closeNewFeatureModal();
            feature_index = 0;
        });

        $(document).on('click', '.lcFeatures', function(e) {
            var features = $('.new-feature .feature');
            for(var i = 0; i < features.length; i++) {
              $(features[i]).hide();
              $(features[i]).addClass('show');
            }
            $(features[0]).show();
            $('.new-feature .right i').removeClass('off');
            $('.new-feature').css('top', 0);
            $('.new-feature').css('left', 0);
            $('.new-feature').css('width', '100%');
            $('.new-feature').css('height', '100%');
            $('.new-feature').show();
        });

        var feature_index = 0;
        $(document).on('click', '.new-feature .left', function(e) {
            var features = $('.new-feature .feature.show');
            if(feature_index === features.length-1 && features.length !== 1) {
              $('.new-feature .right i').removeClass('off');
            }
            if(feature_index-1 === 0) {
              $('.new-feature .left i').addClass('off');
            }

            if(feature_index-1 >= 0) {
              feature_index--;
              $(features[feature_index+1]).hide();
              $(features[feature_index]).show();
            }
        });
        $(document).on('click', '.new-feature .right', function(e) {
            var features = $('.new-feature .feature.show');
            if(feature_index === 0 && features.length !== 1) {
              $('.new-feature .left i').removeClass('off');
            }
            if(feature_index+1 === features.length-1) {
              $('.new-feature .right i').addClass('off');
            }
            if(feature_index+1 < features.length) {
              feature_index++;
              $(features[feature_index-1]).hide();
              $(features[feature_index]).show();
            }
        });
    }());
////////////////////////////////////////////////////////////////////////////////
});
