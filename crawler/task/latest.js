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
    var log = debug("checkUpdate : ");
    log("start");
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

            // recursive from here
            // @todo concurrence to async queue. this iterate should transform into async queue, but not concurrence
            items.some(function (item, index) {
                var url  = item.attribs.href,
                    // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                    date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info
                   // log("Date compare : ", new Date(date) > new Date(latest), date, latest);

                // need prevent date get prolem, such as notice which have no relationship with the data
                // jump from none data source
                // fixed bug: http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_4.html
                // http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html
                // 有最新日期，并且抓取到的日期不大于最新日期的时候，跳出循环
                if (new Date(date) > new Date(latest) && date.split("/").length == 3) {
                    log("start crawl");
                    success(date, url)
                } else {
                    // has updated to the latest items
                    failure && failure();
                    log("date : ", date);
                    log("latest : ", latest);
                    log("stop crawl, no new info");
                    return true
                }
            });

        }, true);
    });
}


module.exports.checkUpdate = checkUpdate;


