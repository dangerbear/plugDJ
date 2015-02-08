var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    process = require("child_process");

var VALID_TXT_RESOURCES = ["robots"];

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
            default:
                return "text/plain";
        }
    },
    writeResource = function(filename, res) {
        var ext = filename.split(".")[1].split("?")[0];
        var filePath = path.join(__dirname, getFilePath(ext), filename);
        console.log("  WRITING: " + filePath);
        var stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': getMimeType(ext),
            'Content-Length': stat.size
        });

        fs.createReadStream(filePath).pipe(res);
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
        } else if (req.url.indexOf(".js") > -1 || req.url.indexOf(".css") > -1 || req.url.indexOf(".html") > -1 || req.url.indexOf(".ico") > -1 || req.url.indexOf(".jpg") > -1) {
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
        var phantomjs = process.exec("./phantomjs phantomPlugDJ.js", function(error, stdout, stderr) {
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

        phantomjs.on('exit', function (code) {
            writeResource("/history.html", res);
            //res.end("</body></html>");
            if (code) {
                console.log('PhantomJS process exited with exit code ' + code);
            }
        });
    };

http.createServer(function (req, res) {
    console.log("REQUESTED: "  + req.url);
    if (req.url.split("?")[0] === "/plugdj") {
        routePlugdj(res);
    } else if (!routeResource(req, res)) {
        routeIndex(res);
    }

}).listen(80, '192.210.192.244');
console.log('Server running at http://dangerbear.com/');