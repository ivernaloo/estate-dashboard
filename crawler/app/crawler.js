var debug     = require('debug'),
    config    = require("config"),
    cheerio   = require('cheerio'),
    request   = require('request'),
    fs        = require('fs'),
    async     = require('async'),
    URL       = config.get("crawler.url"),
    BASE_URL  = config.get("crawler.base"),
    database  = require("../database/mongo"),
    // parseTableData = require("./parseTable").parseTable,
    RESULTS   = {},
    PATH      = {
        "urldatabase": "./crawler/data/database.json",
        "pricedata"  : "./crawler/data/estate.json"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log,
    iconv     = require('iconv-lite');

function saveData(finalTask) {
    log = debug("saveData :");
    fs.writeFile(PATH.pricedata, JSON.stringify(PRICEDATA), function (err) {
        if (err) throw err;
        log('completed save data');
        finalTask && finalTask();
    });
}

// @done storage latest > list 1st
// @done storage latest == list 1st
// @done storage latest < list 1st
// @done check the newest item  whether have been stored
// @done get the latest
// @done
// @todo test the new checkup logic
function checkUpdate(success, failure) {
    var log = debug("checkUpdate : "),
        result;

    log("start");
    database.findLatest(function (latest) { // find storage lastest
        parseList("http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_87.html",function(items, next){
            log("parseList callback ");
            genCollection(items, next, latest, [], null, function(q){
                // @todo should return global total not one by one
                log("total result: ============================== ", q.length)
                success(q)
            });

        });
    });
}


/*
* build a total collection for crawlItems
* @param {Object|Collections} items from list page
* @param {sting|URL} url need parsed
* @param {Array} last collection been build
* @param {function} iteraterfunction  for inner iterate and get the last result
*
* */
function genCollection(items, next, latest, queue, iteratefunction, callback){
    var date,
        _queue = queue || [],
        log = debug("buildUpdateCollection");
    log("start....................from build update Collection")
    // check the first item date
    items.length > 0
        ? date = items[0].children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/")
        : log("items crawl err");


    // recursive from here
    // @done concurrence to async queue. this iterate should transform into async queue, but not concurrence
    // decouple build collection from async crawl queue
    /*
    * return the array contain element lists
    * */
    items.some(function (item, index) {
        var url = item.attribs.href,
            // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
            date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info

        // need prevent date get prolem, such as notice which have no relationship with the data
        // jump from none data source
        // fixed bug: http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_4.html
        // http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html
        // 有最新日期，并且抓取到的日期不大于最新日期的时候，跳出循环
        if (date.split("/").length != 3) date = 0;
        if (new Date(date) > new Date(latest)){
            _queue.push({
                date : date,
                url : url
            })
        }

        // this place need be refacted 2017.4.23

        // iterate next page and update the collection
        // travser to the last element and check the timestamp
        // condition:
        // 1. iterate to the last element
        // 2  item date later than the latest flag?
        // 3. existed the next page
        if( index + 1 == items.length && new Date(date) > new Date(latest) && !!next ){
            // puarseList->genCollection->checkTail
            parseList(BASE_URL + next,function(_items, _next){
                // iterate build collection
                genCollection(_items, _next, latest, _queue, function(q){
                    log("export the final number : ", q.length);
                    callback && callback(q);
                });// lack of callback.
            });
        }

        // the condition for jump out of iterate
        // condition
        // 1 the last page
        // 2 earlier than the latest flag
        if ( ((index + 1 == items.length) && !next) || new Date(date) < new Date(latest)){
            // the cause one by one
            iteratefunction && iteratefunction(_queue);
            return true; // break the iterate
        }
    });
}

function buildCollection(url,latest,callback){
    parseList(URL,function(_items, _next) {

        // travse the items
        items.forEach(function(item, index){

            // check the tail
            if ( checkTail(item.date, latest)){
                // not the terminal
                // push the result to the collection


                // the last item of the page and existed the next page
                // iterate build collection
                buildCollection(BASE_URL+_next);
            }
        });

    })
};

/*
* check wether is tail of the  queue
* @param {sting|date} date of the item
* @param {sting|date} latest flag
* */
function checkTail(date, latest){
    // condition
    // 1 the last page
    // 2 earlier than the latest flag
    return new Date(date) < new Date(latest)
}

/*
* getList的启动函数
* */
function init() {
    var log = debug("init");

    log("start");

    checkUpdate(function(date, url){
        // log(latest);
        // @done bug, parseList cause recursive call
        // the cause is parseList and crawlist repeat done the recursive logic
        // checkupdate has get the need update items collection,so there needn't recursive call the crawlist again
        // using parseItem should me better.
        // but , how to handle the turn flip over logic
        // parse the url
        // @todo in order in solve the problem. should decouple the crawlItem from crawList
        // @todo flip logic should set in the checkupdate context
        // parseList(URL, function(items, next){
        //     crawlist(items, next, latest)
        // });
        log({date: date, url: url});
        // crawlItems(date, url)
    },function(){
        // end all logic
    });

}
/*
* parse the list
* @param {string} url
* @param {function} callback
* @param {function} next tick
*/
function parseList(url, callback) {
    log = debug("parseList : ");

    log("list url : ", url);
    request({
        method  : 'GET',
        uri     : url,
        encoding: null
    }, function (err, res, body) {
        if ( !!res.statusCode && res.statusCode == 200) {
            var $          = cheerio.load(iconv.decode(body, 'gb2312')),
                items      = $(".service").toArray(), // get the list result

                next       = null; // get the next page

            // fixed the last page problem
            if ( !! $("a:contains(下一页)")[0] ) {
                next = $("a:contains(下一页)")[0].attribs.href;
            }

            // use spider to crawl the detail in the list
            callback &&callback(items, next);
        } else {
            log("getlist error..")
        }
    })
}

// @done 抓取item
/*
* crawl list
* @param {date} items get from list
* @param {String|Url}
* */
function crawlItems(date, url){
    var funcSeries = [],
        log = debug("crawlItems");

    log("start");
    funcSeries.push(function (cb) {
        log("parseTable : ", date);
        return parseTable(url, function (data) {
            cb(null, {"date": date, "data": data}); // push the data to the callback results
        })
    });

    ;


    //  @done item : each async, modify the each cocurrence to async logic. one by one
    async.series(funcSeries, function (err, results) {
        if ( !err ){
            // log("err : ", err);
            database.insertDocuments(results);
            log("next : ", next);
            // have the next page
            // stopFlag is false, when stopFlag is true, stop next step
            // @done prevent recursive parseList after checkupdate
            // next && !stopFlag && parseList(BASE_URL + next, function(items, next){
            //     crawlist(items, next)
            // });
            // recursive the next list page
            //  @done list : detect async,recurisve get the next page
        } else {
            log("async.series error");
        }
    });
}

// @done 抓取列表从解析列表中拿出来
/*
* crawl list
* @param {Array} items get from list
* @param {String|Url}
* @param {Date|String} storage latest datestamp
* */
function crawlist(items, next, latest){
    var funcSeries = [],
        stopFlag = false;

    items.some(function (item, index) {
        var url  = item.attribs.href,
            // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
            date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info

        // jump from none data source
        // fixed bug: http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_4.html
        // http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html
        // 有最新日期，并且抓取到的日期不大于最新日期的时候，跳出循环
        if (date.indexOf("/") < 4 || date.split("/").length != 3 || ( latest && !(date > latest) )) {
            log("stop : ", stopFlag);
            stopFlag = true;
            return stopFlag;
        } else {
            funcSeries.push(function (cb) {
                log("parseTable : ", date);
                return parseTable(url, function (data) {
                    cb(null, {"date": date, "data": data}); // push the data to the callback results
                })
            });
        }
    });


    //  @done item : each async, modify the each cocurrence to async logic. one by one
    async.series(funcSeries, function (err, results) {
        if ( !err ){
            // log("err : ", err);
            database.insertDocuments(results);
            log("next : ", next);
            // have the next page
            // stopFlag is false, when stopFlag is true, stop next step
            // @done prevent recursive parseList after checkupdate
            next && !stopFlag && parseList(BASE_URL + next, function(items, next){
                crawlist(items, next)
            }); // recursive the next list page
                //  @done list : detect async,recurisve get the next page
        } else {
            log("async.series error");
        }
    });
}
/*
* 初始化价格数据库
* */
function initPriceData() {
    return fs.readFileSync(PATH.pricedata, 'utf8');
}

/*
* given a url, get the page and parse table
* then return the data
*
* @param {Sting} url
* @callback {Function}
* @return {JSON[Object]}
*
* */
function parseTable(url, callback) {
    var log      = debug("parseTable : "),
        base     = config.get("crawler.base"),
        headings = [],
        h1s,
        h2s; // custom heading;

    request({
        method  : 'GET',
        uri     : base + url,
        encoding: null
    }, function (err, res, body) {
        log("err : ", err);
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(iconv.decode(body, 'gb2312'), {
                decodeEntities: false
            });

            var Table = $($("#artibody > p").html());
            var trs = []; // trs collection
            var table = []; // html table parse result

            h1s = $(Table.find("tr")[0]).find("td");
            h2s = $(Table.find("tr")[1]).find("td");
            h1s.each(function (i, elem) {
                if (i < 1) {
                    headings.push($($(elem).find("font")).html()); // insert the first title
                    return;
                }
                headings.push($($(elem).find("font")).html() + "-" + $($(h2s[2 * (i - 1)]).find("font")).html(), $($(elem).find("font")).html() + "-" + $($(h2s[2 * i - 1]).find("font")).html());
            });

            $(Table.find("tr")).each(function (i, el) {
                trs.push($(el).html());
            });

            // traverse line proceed very tr line to combine the data set
            arrayify(trs, [2, -2]).map(function (tr, i) {
                var _item = {};

                // traverse item
                $($(tr).find("font")).each(function (index, el) {
                    _item[headings[index]] = $(el).html()
                });

                table.push(_item);
            });

            callback(table);

        } else {
            log("request error")
        }
    })

}

/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @param  range such as [2,2] to indicate range to cut
 * @return {Array} the converted object
 */
function arrayify(collection, range) {
    if (range) {
        _array = collection.slice(range[0], range[1])
    }
    return _array; // simple convert array-like to array
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
    var log = debug("factory : ");

    return function (row) {
        return arrayify(row.cells).reduce(function (prev, curr, i) {
            prev[headings[i]] = curr.innerText;
            return prev;
        }, {});
    }
}

module.exports.init = init;
module.exports.parseList = parseList;
