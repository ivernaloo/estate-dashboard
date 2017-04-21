/*
 * find the latest news
 *
 * */

var debug = require("debug"),
    database = require("../database/mongo"),
    config = require("config"),
    root = process.cwd(),
    URL = config.get("crawler.url"),
    crawler = require(root + "/crawler/app/crawler.js");
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
        crawler.parseList(URL,function(items, next){
            buildUpdateCollection(items, next, latest)
        });
    });
}

function buildUpdateCollection(items, next, latest, queue){
            var date,
                _queue = queue || [];

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
        /*
        * return the array contain element lists
        * */
        var _temp = items.filter(function (item, index) {
            var url = item.attribs.href,
                // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info

            // need prevent date get prolem, such as notice which have no relationship with the data
            // jump from none data source
            // fixed bug: http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_4.html
            // http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html
            // 有最新日期，并且抓取到的日期不大于最新日期的时候，跳出循环
            if (date.split("/").length != 3) date = 0;
            log("index : ", index);

            // recursive next page and update the collectio
            if( index + 1 == items.length && new Date(date) > new Date(latest) ){
                crawler.parseList(URL,function(items, next){
                    buildUpdateCollection(items, next, latest, _queue)
                });
            }
            return new Date(date) > new Date(latest);
        });

        _queue = _queue.concat(_temp); // combine the new array data

}

module.exports.checkUpdate = checkUpdate;


