var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    phantom = require('./resources/js/phantom'),
    childProcess = require("child_process"),
    processHistory = require("./resources/js/processHistoryNoJQuery"),
    homePage = require("./resources/js/homePage");
//    testHistoryData = require("./testHistoryData");

var VALID_TXT_RESOURCES = ["robots"];

console.log("arg length = " + process.argv.length);
if (process.argv.length !== 4) {
    console.log('Usage: index.js <uid> <pwd>');
    throw "Invalid arguments!";
}

var routeIndex = function(res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('index\n');
    },
    getFilePath = function(ext) {
        switch (ext) {
            case "js":
                return "/resources/js";
            case "css":
                return "/resources/css";
            case "jpg":
                return "/resources/images";
            case "hbs":
                return "/resources/templates";
            default:
                return "";
        }
    },
    getMimeType = function(ext) {
        switch (ext) {
            case "js":
                return "text/javascript";
            case "css":
                return "text/css";
            case "html":
                return "text/html";
            case "ico":
                return "image/x-icon";
            case "jpg":
                return "image/jpeg";
            case "hbs":
                return "text/x-handlebars-template";
            default:
                return "text/plain";
        }
    },
    writeResource = function(filename, res) {
        try {
            var ext = filename.split(".")[1].split("?")[0];
            var filePath = path.join(__dirname, getFilePath(ext), filename);
            console.log("  WRITING: " + filePath);
            var stat = fs.statSync(filePath);

            res.writeHead(200, {
                'Content-Type': getMimeType(ext),
                'Content-Length': stat.size
            });

            fs.createReadStream(filePath).pipe(res);
        } catch (e) {
            console.log("  WRITING_FAILED: " + e);
            res.end();
        }
    },
    whitelistResource = function(filename, ext, whitelist, res) {
        for (var i = 0; i < whitelist.length; i++) {
            if (filename.indexOf(whitelist[i] + "." + ext) > -1) {
                writeResource(filename, res);
                return true;
            }
        }
        return false;
    },
    routeResource = function(req, res) {
        if (req.url.indexOf(".txt") > -1) {
            return whitelistResource(req.url, "txt", VALID_TXT_RESOURCES, res);
        } else if (req.url.indexOf(".js") > -1
            || req.url.indexOf(".css") > -1
            || req.url.indexOf(".html") > -1
            || req.url.indexOf(".ico") > -1
            || req.url.indexOf(".jpg") > -1
            || req.url.indexOf(".hbs") > -1) {
            writeResource(req.url, res);
            return true;
        }
        return false;
    },
    routePlugdj = function(res) {
        //res.writeHead(200, {
        //    'Content-Type': getMimeType("html")
        //});
        //res.write("<html><header><link rel='stylesheet' type='text/css' href='list.css'/><script src='//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js' /><script src='/plugdj.js' /></header><body>");
        var phantomjs = childProcess.exec("./phantomjs phantomPlugDJ.js " + process.argv[2] + " " + process.argv[3], function(error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
            }
            //console.log('stdout: ' + stdout);
            //res.write(stdout);
            if (stderr) {
                console.log('stderr: ' + stderr);
            }
        });
        var result = '';
        phantomjs.stdout.on('data', function(data) {
            result += data.toString();
        });

        phantomjs.on('exit', function (code) {
            var retVal = "<html><header><link rel='stylesheet' type='text/css' href='list.css'/>" +
                    "<script src='//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js'></script>" +
                    "<script src='//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js'></script>" +
                    "<script src='/plugdj.js'></script></script></header><body>" +
                    "<div><button id='scBtn' class='pressed'>SoundCloud</button><button id='ytBtn'>YouTube</button><button id='refreshList'>Refresh</button></div>" +
                    processHistory.buildHTML(JSON.parse(result)) +
                    "</body></html>";
            res.end(retVal);
//            writeResource("/history.html", res);
            if (code) {
                console.log('PhantomJS process exited with exit code ' + code);
            }
        });
    };

http.createServer(function (req, res) {
    console.log("REQUESTED " + req.method + ": " + req.url);
    if (req.method === 'POST' && req.url.split("?")[0] === "/plugdjData") {
        // the body of the POST is JSON payload.
        var data = '';
        req.addListener('data', function (chunk) {
            console.log("Writing chunk: " + chunk);
            data += chunk;
        });
        req.addListener('end', function () {
            try {
                //var myJSON = JSON.parse(data);
                fs.write("json.js", data, 'w');
                console.log("Writing JSON to file: ");
                res.writeHead(200, {'content-type': 'text/plain'});
                res.end();
            } catch ( e ) {
                console.error("Error writing JSON to file: " + e);
                res.writeHead(500, {'content-type': 'text/plain' });
                res.write('ERROR:' + e);
                res.end('\n');
            }
        });
    } else {
        if (req.url.split("?")[0] === "/plugdj") {
            phantom.openPlugDJ(process.argv[2], process.argv[3]);
            homePage.build(res);
        } else if (req.url.split("?")[0] === "/plugdjJSON") {
            phantom.getCurrentMediaData(res);
        } else if (req.url.split("?")[0] === "/plugdjJSONAll") {
            phantom.getHistoryMediaData(res);
        } else if (req.url.split("?")[0] === "/resetPhantom") {
            phantom.disconnect();
            res.end("Done!");
        } else if (!routeResource(req, res)) {
            routeIndex(res);
        }
    }

}).listen(80, '192.210.192.244');
console.log('Server running at http://dangerbear.com/');