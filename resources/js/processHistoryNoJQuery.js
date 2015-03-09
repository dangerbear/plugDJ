var processThumbnail = function(url) {
    var src = "http:" + url;
    if (!url || url.indexOf("images/soundcloud") > -1) {
        src = "soundCloud.jpg";
    }
    return '<img src="' + src + '"/>';
};

var processHistory = function(historyData, mediaFormat, olStyle) {
    var retVal = '<ol';
    if (mediaFormat) {
        if (mediaFormat === 1) {
            retVal += ' id="ytList"';
        } else {
            retVal += ' id="scList"';
        }
    }
    if (olStyle) {
        retVal += ' style="' + olStyle + '"';
    }
    retVal += '>';
    for (var i = 0; i < historyData.length; i++) {
        var o = historyData[i],
            li = '<li>';
        if (mediaFormat && mediaFormat === o.media.format) {
            var href = o.media.cid;
            if (o.media.format === 1) {
                href = "https://www.youtube.com/watch?v=" + href;
            } else {
                href = "soundcloud://tracks:" + href;
            }
            li += processThumbnail(o.media.image);
            li += '<div class="songDetail">';
            li += '<a href="' + href + '" target="_blank" class="' + (o.media.format === 2 ? 'isSoundCloud' : '') + '" data-cid="' + o.media.cid + '">' + o.media.title + '</a>';
            li += '<span class="songArtist">[' + o.media.duration + ':' + (o.media.format === 1 ? 'YT' : 'SC') + ']  ' + o.media.author + '</span>';
            li += '<span class="songWoot statCount">' + o.score.positive + '</span>';
            li += '<span class="songGrab statCount">' + o.score.grabs + '</span>';
            li += '<span class="songMeh statCount">' + o.score.negative + '</span>';
            li += '<span class="songPeeps statCount">' + o.score.listeners + '</span>';
            li += '<span class="songDJ">' + o.user.username + '</span>';
            li += '</div></li>';
            retVal += li;
        }
    }
    return retVal + '</ol>';
};

module.exports = {
    buildHTML: function(historyData) {
        "use strict";
        var soundCloundList = processHistory(historyData, 2);
        var youTubeList = processHistory(historyData, 1, "display: none");
        return soundCloundList + youTubeList;
    }
};