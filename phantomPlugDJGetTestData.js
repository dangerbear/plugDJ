var testHistoryData = require('./testHistoryData.js'),
    page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log('Page console.log: ' + msg);
};

page.onLoadFinished = function(status) {
    console.log('Load Finished: ' + status);
};
page.customHeaders = {
    "Accept-Language": "en-US,en;q=0.8"
};

page.open('https://google.com', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {
        console.log(JSON.stringify(testHistoryData.getData()));
        phantom.exit();
    }
});
