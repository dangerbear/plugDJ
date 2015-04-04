var phantom = require('phantom');

var WAIT_DELAY = 5000,
    WATCHDOG_INTERVAL = 1000*60*10, // 10 mins
    requestedWithinWatchdog = false,
    watchdogTimerId = 0,
    _phantom = null,
    _page = null,
    _logConsole = false,
    _loggingIn = false,
    _loggedIn = false,
    _pageReady = false;

var isConnected = function() {
    "use strict";
    return _phantom && _page;
};

var openPlugDJ = function(uid, pwd, logConsole) {
    "use strict";
    _logConsole = logConsole;
    if (!isConnected()) {
        phantom.create(function (ph) {
            _phantom = ph;
            _phantom.createPage(function (page) {
                _page = page;
                _page.set('customHeaders', { "Accept-Language": "en-US,en;q=0.8" }, function() {
                    _page.open('https://plug.dj/mashupfm', function (status) {
                        if (status == "success") {
                            console.log("plug.dj opened ", status);
//                            _page.render('plugDJHome.png');
                            loginToPlugDJ(uid, pwd);
                        }
                    });
                });
            });
        }, {
            dnodeOpts: {
                weak: false
            }
        });
    }
};

var loginToPlugDJ = function(uid, pwd) {
    "use strict";
    if (!_loggingIn) {
        _loggingIn = true;
        if (!_loggedIn) {
            //_page.render('beforeLogin.png');
            _page.evaluate(function (uid, pwd) {
                $(".existing button:first").click();
                $("#email").attr("value", uid);
                $("#password").attr("value", pwd);
                $("#submit").click();
            }, function () {
                _loggedIn = true;
                console.log("Login successful!");
            }, uid, pwd);
        } else {
            // wait a second and then try to enter the login credential
            setTimeout(loginToPlugDJ, 1000);
        }
    }
};

var isPageReady = function() {
    "use strict";
    if (isConnected() && !_pageReady) {
        _page.evaluate(function () {
            try {
                if ($("#now-playing-media").length) {
                    $("body").remove();
                    return true;
                }
            } catch (x) {
                // ignore
            }
            return false;
        }, function(result) {
            _pageReady = result;
            if (_pageReady) {
                console.log("Page ready!");
            }
        });
    }
    return _pageReady;
};

var getCurrentMediaData = function(response) {
    "use strict";
    if (isPageReady()) {
        _page.evaluate(function () {
            return { media: API.getMedia() };
        }, function (result) {
            response.end(JSON.stringify(result));
        });
    } else {
        // wait a bit and try again
        setTimeout(function() {
            getCurrentMediaData(response);
        }, WAIT_DELAY);
    }
};

var getHistoryMediaData = function(response) {
    "use strict";
    if (isPageReady()) {
        _page.evaluate(function () {
            return API.getHistory();
        }, function (result) {
            response.end(JSON.stringify(result));
        });
    } else {
        // wait a bit and try again
        setTimeout(function() {
            getHistoryMediaData(response);
        }, WAIT_DELAY);
    }
};

var closePhantom = function() {
    "use strict";
    if (isConnected()) {
        _page.evaluate(function () { return "close"; }, function (result) {
            console.log('Page action: ' + result);
            _page.exit();
            _page = null;
            _phantom = null;
            if (watchdogTimerId) {
                clearTimeout(watchdogTimerId);
            }
        });
    }
};

module.exports = {
    openPlugDJ: openPlugDJ,
    getCurrentMediaData: getCurrentMediaData,
    getHistoryMediaData: getHistoryMediaData,
    disconnect: closePhantom
};
