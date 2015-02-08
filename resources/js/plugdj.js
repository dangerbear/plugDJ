var playedList = [];

$(document).ready(function() {
    $("body").prepend($("<div/>").attr("id", "ts").text(new Date())).on("click", "li a", function(ev) {
        var $a = $(this);
        $a.parents("li:first").addClass("played");
        playedList.push($a.data().cid);
    }).on("click", "#scBtn", function(ev) {
        $(this).addClass("pressed");
        $("#ytBtn").removeClass("pressed");
        $("#ytList").hide();
        $("#scList").show();
    }).on("click", "#ytBtn", function(ev) {
        $(this).addClass("pressed");
        $("#scBtn").removeClass("pressed");
        $("#scList").hide();
        $("#ytList").show();
    }).on("click", "#refreshList", function(ev) {
        var $ts = $("#ts");
        $ts.text("refreshing...");
        $.ajax({
            url: "/plugdj",
            cache: false
        }).done(function (data) {
            var $data = $(data);
            if ($data.length < 4) {
                $ts.text(new Date() + "    ...last refresh failed!");
            } else {
                $("#scList").empty().append($(data)[2].innerHTML);
                $("#ytList").empty().append($(data)[3].innerHTML);
                $("li a").each(function () {
                    var $a = $(this);
                    if (_.contains(playedList, $a.data().cid)) {
                        $a.parents("li:first").addClass("played");
                    }
                });
                $ts.text(new Date());
            }
        });
    });
});