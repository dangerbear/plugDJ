var handlebars = require("node-handlebars");    // npm install node-handlebars

var hbsData = {
        css: ["list"],
        js: ["//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
                "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore-min",
                "//cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.0/handlebars.min",
                "//connect.soundcloud.com/sdk",
                "/plugdj"]
    },
    templatesDir = "./resources/templates";

var build = function(response) {
    "use strict";
    var hbs = handlebars.create({
        partialsDir: templatesDir
    });

    hbs.engine(templatesDir + "/home.hbs", hbsData, function(err, html) {
        if (err) {
            throw err;
        }
        response.end(html);
    });
};

module.exports = {
    build: build
};
