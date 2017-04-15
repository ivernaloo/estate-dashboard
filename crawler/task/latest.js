/*
* find the latest news
*
* */

var debug    = require("debug"),
    database = require("../database/mongo"),
    config   = require("config"),
    root     = process.cwd(),
    URL      = config.get("crawler.url"),
    crawler  = require(root + "/crawler/app/crawler.js");
log = debug("latest : ");

// @done storage latest > list 1st
// @done storage latest == list 1st
// @done storage latest < list 1st
// @done check the newest item  whether have been stored
// @done get the latest
// @done
function checkUpdate(success, failure) {

    database.findLatest(function (latest) { // find storage lastest
        crawler.parseList(URL, function (items, next) {
            var date;

            // check the first item date
            items.length > 0
                ? date = items[0].children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/")
                : log("items crawl err");

            if (date.indexOf("/") != 4 || date.split("/").length != 3) {
                log("something wrong in date get : ", date);
                log("something wrong in date get : ", date.indexOf("/"));
                log("something wrong in date get : ", date.indexOf("/") != 4);
                log("something wrong in date get : ", date.split("/").length != 3);
                return; // no date and jump from the source
            }

            items.some(function (item, index) {
                var url  = item.attribs.href,
                    // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                    date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info

                if (new Date(date) > new Date(latest)) {
                    log("start crawl");
                    success(latest)
                } else {
                    failure && failure();
                    log("date : ", date);
                    log("latest : ", latest);
                    log("stop crawl, no new info");
                    return true
                }
            });

        });
    });
}


module.exports.checkUpdate = checkUpdate;


