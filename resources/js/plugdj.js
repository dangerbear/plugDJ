var playedList = [],
    songHBSTemplate,
    SCAPIKey = "8e20c885ec9178c3e08005b4ae3818ba",
    timeoutId = 0,
    youtubePlayer;

var playSC = function(cid, length) {
    "use strict";
    $.getJSON("https://api.soundcloud.com/tracks/" + cid + "?policy=ALLOW&client_id=" + SCAPIKey, function (data) {
        SC.oEmbed(data.permalink_url, { auto_play: true, show_comments: false, maxheight: 166, maxwidth: 600 }, function(oEmbed) {
            $("#player").append(oEmbed.html);
            timeoutId = setTimeout(loadCurrentSong, length * 1000);
        });
    });

    //SC.stream("/tracks/" + cid, function(sound){
    //    sound.play();
    //});
};

//var onYTPlayerReady = function (event) {
//    "use strict";
//    event.target.playVideo();
//};
//
//var onYTPlayerStateChange = function(event) {
//    "use strict";
//    if (event.data === YT.PlayerState.ENDED) {
//        loadCurrentSong();
//    }
//};

var playYT = function(id, length) {
    "use strict";
    location.href = "https://www.youtube.com/watch?v=" + id;
    timeoutId = setTimeout(loadCurrentSong, length * 1000);
    //$("#player").empty().append('<iframe title="YouTube video player" src="http://www.youtube.com/embed/' + id + '" width="480" height="390" frameborder="0"></iframe>');
    //youtubePlayer = new YT.Player('player', {
    //    height: '360',
    //    width: '640',
    //    videoId: id,
    //    events: {
    //        'onReady': onYTPlayerReady,
    //        'onStateChange': onYTPlayerStateChange
    //    }
    //});
};

var playCurrentSong = function(data) {
    "use strict";
    playedList.push(data.cid);
    if (timeoutId) {
        clearTimeout(timeoutId);
    //} else if (youtubePlayer) {
    //    youtubePlayer.destroy();
    //    youtubePlayer = null;
    }
    $("#player").empty();
    if (data.media.format == 1) {
        // youtube
        playYT(data.media.cid, data.media.duration);
    } else {
        // soundcloud
        playSC(data.media.cid, data.media.duration);
    }
};

var replaceCurrentSong = function(newSong, songData) {
    "use strict";
    var currentLI = $("#currentSong li");
    // move if song is in history list
    if (currentLI.length && $("#songHistory a[data-cid=" + currentLI.find("a").data().cid + "]").length === 0) {
        currentLI.addClass("played");
        $("#songHistory ol").prepend(currentLI);
    }
    $("#currentSong").append(newSong);
    playCurrentSong(songData);
};

var hbsProcessSong = function(data) {
    if (data.media.format == 1) {
        data.media.formatType = "YT";
    } else {
        data.media.formatType = "SC";
    }
    return songHBSTemplate(data);
};

var loadCurrentSong = function() {
    "use strict";
    $.getJSON("/plugdjJSON", function(data) {
        "use strict";
        replaceCurrentSong(hbsProcessSong(data), data);
    });
};

var loadAllSongs = function(callback) {
    "use strict";
    $.getJSON("/plugdjJSONAll", function (data) {
        "use strict";

        if (data && data.length) {
            // first song in the history list is the current song
            var currentSong = data[0];
            replaceCurrentSong(hbsProcessSong(currentSong), currentSong);
            var arrSongHtml = [];
            for (var i = 1; i < data.length; i++) {
                arrSongHtml.push(hbsProcessSong(data[i]));
            }
            $("#songHistory ol").empty().append(arrSongHtml.join(""));

            if (callback) {
                callback();
            }
        } else {
            $("#songHistory ol").text("Issue getting song list!");
        }
    });
};

$(document).ready(function() {
    SC.initialize({
        client_id: SCAPIKey
    });

    $("#ts").text(new Date());
    $("body").on("click", "li a", function() {
        var $a = $(this);
        replaceCurrentSong($a.parents("li:first"), {
            media: {
                format: $a.data().format,
                cid: $a.data().cid,
                duration: $a.data().duration
            }
        });
        return false;
    }).on("click", "#refreshList", function() {
        var $ts = $("#ts");
        $ts.text("refreshing...");

        loadAllSongs(function() {
            "use strict";
            $("li a").each(function () {
                var $a = $(this);
                if (_.contains(playedList, $a.data().cid)) {
                    $a.parents("li:first").addClass("played");
                }
            });
            $ts.text(new Date());
        });
    });

    $.ajax({
        url: "/song.hbs",
        cache: true
    }).done(function(data) {
        songHBSTemplate = Handlebars.compile(data);

        loadAllSongs();
    });
});