var fs = require('fs');
var page = require('webpage').create();

//page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', function() {
//    // jQuery is loaded, now manipulate the DOM
//    page.evaluate(function() {
//    });
//    fs.write("history.html", page.content, 'w');
//    phantom.exit();
//});

//page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36";
//page.viewportSize = {
//    width: 1280,
//    height: 720
//};
page.customHeaders = {
    "Accept-Language": "en-US,en;q=0.8"
};

page.open('https://plug.dj/mashupfm', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {

//        page.render('example.png');
        // login
        page.evaluate(function () {
            $(".existing button:first").click();
        });
        page.evaluate(function () {
            $("#email").val();
            $("#password").val();
            $("#submit").click();
        });
        setTimeout(function() {
            //var content = page.evaluate(function () {
            //    return JSON.stringify(API.getHistory());
            //});
            //fs.write("history.txt", content, 'w');

//            page.render('page.png');
            page.includeJs('http://dangerbear.com/processHistory.js', function() {
                var html = page.evaluate(function() {
                    var historyData = API.getHistory();
                    var soundCloundList = processHistory(historyData, 2)[0].outerHTML;
                    var youTubeList = processHistory(historyData, 1, "display: none")[0].outerHTML;
                    return soundCloundList + youTubeList;
                });
                var retVal = "<html><header><link rel='stylesheet' type='text/css' href='list.css'/>" +
                    "<script src='//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js'></script>" +
                    "<script src='//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js'></script>" +
                    "<script src='/plugdj.js'></script></header><body>" +
                    "<div><button id='scBtn' class='pressed'>SoundCloud</button><button id='ytBtn'>YouTube</button><button id='refreshList'>Refresh</button></div>" +
                    html + "</body></html>";
                fs.write("history.html", retVal, 'w');
//                console.log(retVal);
                phantom.exit();
            });
        }, 4000);
    }
});

//var SOUNDCLOUD_API_KEY = "8e20c885ec9178c3e08005b4ae3818ba";

//.on("click", "li", function(ev) {
//    if (ev.target.tagName !== "A") {
//        var $li = $(this);
//        var $a = $("a", $li);
//        if ($a.hasClass("isSoundCloud")) {
//            $.ajax({
//                url: "https://api.soundcloud.com/tracks/" + $a.attr("href") + "?policy=ALLOW&client_id=" + SOUNDCLOUD_API_KEY
//            }).done(function (data) {
//                $a.attr("href", $("track > permalink-url", $(data)).text()).removeClass("isSoundCloud").trigger("click");
//                $li.addClass("played");
//            })
//        } else {
//            $li.addClass("played");
//        }
//    }
//})
