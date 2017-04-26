var debug    = require('debug'),
    config   = require("config"),
    cheerio  = require('cheerio'),
    request  = require('request'),
    fs       = require('fs'),
    async    = require('async'),
    URL      = config.get("crawler.url"),
    BASE_URL = config.get("crawler.base"),
    database = require("../database/mongo"),
    log,
    iconv    = require('iconv-lite');


// @done storage latest > list 1st
// @done storage latest == list 1st
// @done storage latest < list 1st
// @done check the newest item  whether have been stored
// @done get the latest
// @done
// @done test the new checkup logic
function update(success, failure) {
    var log = debug("checkUpdate : ");

    log("start"); // callback hell
    database.findLatest(function (latest) { // find storage lastest
        buildCollection(URL, latest, function (q) {
            crawList(q, function (result) {
                database.insertDocuments(result)
            });
        });
    });
}

update();

function buildCollection(url, latest, finalTask) {
    var queue = [],
        log   = debug("buildCollection");
    log("start");
    parseList(url, function (items, next) {
        // travse the items
        items.some(function (item, index) {
            var url  = item.attribs.href,
                // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info
            // check right date format
            if (date.split("/").length == 3) {

                // check the tail, still have need update item
                if (checkLatest(date, latest)) {
                    // weak detection for  right date info
                    // not the terminal
                    // push the result to the collection
                    queue.push({
                        date: date,
                        url : url
                    });


                    // the last item of the page and existed the next page
                    // iterate build collection
                    if (index + 1 == items.length && !!next) {
                        buildCollection(BASE_URL + next, latest, function (q) {
                            var _q = q.concat(queue)
                            // excute the final task
                            log("final task", _q.length);
                            finalTask(_q);
                        });
                    }

                    // judge the terminal and return the final result
                    // condition
                    // 1 the last page
                    // 2 earlier than the latest flag
                    if (index + 1 == items.length && !next) {
                        log("the real last")
                        log("the real last queue length: ", queue.length);
                        finalTask(queue)
                    }


                } else {
                    // termial and not continue to iterate
                    // bug @todo date run

                    log("date/latest : ", date, latest);
                    log("final task and not the end of list");
                    log("final task and not the end of list , queue length : ", queue.length);
                    finalTask(queue);
                    return true;
                }
            }

        });

    })
};

/*
* check wether is tail of the  queue
* @param {sting|date} date of the item
* @param {sting|date} latest flag
* */
function checkLatest(date, latest) {
    // condition
    // 1 the last page
    // 2 earlier than the latest flag
    return new Date(date) > new Date(latest);
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
        if (!!res.statusCode && res.statusCode == 200) {
            var $     = cheerio.load(iconv.decode(body, 'gb2312')),
                items = $(".service").toArray(), // get the list result

                next  = null; // get the next page

            // fixed the last page problem
            if (!!$("a:contains(下一页)")[0]) {
                next = $("a:contains(下一页)")[0].attribs.href;
            }

            // use spider to crawl the detail in the list
            callback && callback(items, next);
        } else {
            log("getList error..")
        }
    })
}

// @done 抓取item
/*
* crawl list
* @param {date} items get from list
* @param {String|Url}
* */
function crawlItem(item, callback) {
    var log = debug("crawlItem");

    log(item.date);

    parseTable(item.url, function (data) {
        // log({"date": item.date, "data": data});
        // push the data to the callback results
        // database.insertDocuments(results); results is a collection build with {"date":...,"data":...}
        callback && callback({"date": item.date, "data": data, "timestamp": new Date(item.date).getTime()});
    })
}


// @done 抓取列表从解析列表中拿出来
/*
* factory fucntion for distribute task to crawlItem
* @param {Array} item lists need rank into async queue for crawler
* @param {callback} callback that excute when complete the queue task
* */
function crawList(items, callback) {
    var log     = debug("crawList"),
        results = [];

    if (items.length > 0) {
        //  @done item : each async, modify the each cocurrence to async logic. one by one
        async.eachSeries(items, function (item, next) {
            // crawItem one by one
            crawlItem(item, function (content) {
                results.push(content);
                next(null); // next
            })
        }, function (err) {
            // final
            log("final");
            log("results : ", results.length)
            callback && callback(results)
        });
    } else {
        log("Errors in crawList, no update collection");
    }

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
 * @param  {Array|String} headings the values of the table's <thead>
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

module.exports.parseList = parseList;
