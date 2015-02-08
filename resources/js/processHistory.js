function processThumbnail(url) {
    var src = "http:" + url;
    if (!url || url.indexOf("images/soundcloud") > -1) {
        src = "soundCloud.jpg";
    }
    return $("<img/>").attr("src", src);
}

function processHistory(historyData, mediaFormat, olStyle) {
    var ol = $("<ol/>");
    if (mediaFormat) {
        if (mediaFormat === 1) {
            ol.attr("id", "ytList");
        } else {
            ol.attr("id", "scList");
        }
    }
    if (olStyle) {
        ol.attr("style", olStyle);
    }
    $.each(historyData, function (i, o) {
        var li = $("<li/>");
        if (mediaFormat && mediaFormat === o.media.format) {
            var href = o.media.cid;
            if (o.media.format === 1) {
                href = "https://www.youtube.com/watch?v=" + href;
            } else {
                href = "soundcloud://tracks:" + href;
            }
            li.append(processThumbnail(o.media.image))
                .append($("<div/>").addClass("songDetail")
                    .append($("<a/>").attr("href", href).attr("target", "_blank").addClass(o.media.format === 2 ? "isSoundCloud" : "").attr("data-cid", o.media.cid).text(o.media.title))
                    .append($("<span/>").addClass("songArtist").text("[" + o.media.duration + ":" + (o.media.format === 1 ? "YT" : "SC") + "]  " + o.media.author))
                    .append($("<span/>").addClass("songWoot statCount").text(o.score.positive))
                    .append($("<span/>").addClass("songGrab statCount").text(o.score.grabs))
                    .append($("<span/>").addClass("songMeh statCount").text(o.score.negative))
                    .append($("<span/>").addClass("songPeeps statCount").text(o.score.listeners))
                    .append($("<span/>").addClass("songDJ").text(o.user.username))
            );
            ol.append(li);
        }
    });
    return ol;
}