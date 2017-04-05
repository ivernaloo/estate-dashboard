var debug     = require('debug'),
    config    = require("config"),
    cheerio   = require('cheerio'),
    request   = require('request'),
    fs        = require('fs'),
    async     = require('async'),
    iconv = require('iconv-lite'),
    URL       = config.get("crawler.url"),
    // parseTableData = require("./parseTable").parseTable,
    RESULTS   = {},
    PATH      = {
        "urldatabase": "./crawler/data/database.json",
        "pricedata"  : "./crawler/data/estate.json"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log,
    iconv = require('iconv-lite');

function saveData(finalTask) {
    log = debug("saveData :");
    fs.writeFile(PATH.pricedata, JSON.stringify(PRICEDATA), function (err) {
        if (err) throw err;
        log('completed save data');
        finalTask && finalTask();
    });
}

/*
* getList的启动函数
* */
function init(finalTask) {
    var log = debug("init");

    log("start");

    var _exist = false,
        _n     = 2,
        _base  = URL.split(".html")[0];

    // parse the url
    parseList(URL);
}

// parse the list
function parseList(url, callback, next) {
    log = debug("parseList : ");
    log("start..");

    request(url, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $     = cheerio.load(body),
                items = $(".service"), // get the list result
                n     = 1;

            // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
            items.each(function (i, elem) {
                var url  = $(elem).attr("href"),
                    date = $(elem).text().replace(/\D+/g, " ").split(" ").slice(0, 3).join("/");
                if (i > 0) return; // test
                parseTable(url, function (data) {
                    log("parseTable : ", data, date);
                })
            });
        } else {
            log("getlist error..")
        }
    })
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
        method: 'GET',
        uri:base + url,
        encoding: null
    }, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(iconv.decode(body, 'gb2312'), {
                decodeEntities: false
            });

            var Table = $($("#artibody > p").html());
            log(Table)
            h1s = Table.find("tr")[0].children;
            h2s = Table.find("tr")[0].children;
            $(Table.find("tr")[0]).find("td").each(function(i, elem){
                log("elem: ", $($(elem).find("font")).html())
            })
            h1s.forEach(function(h1, i){
                if ( i < 1){
                    return;
                }

            })

        } else {
            log("request error")
        }
    })

}


/**
 * given a table, generate an array of objects.
 * each object corresponds to a row in the table.
 * each object's key/value pairs correspond to a column's heading and the row's value for that column
 *
 * @param  {HTMLTableElement} table the table to convert
 * @return {Array[Object]}    array of objects representing each row in the table
 */
/*
function parseTable(table) {
    var headings = [],
        h1s      = table.find("tr")[0].children,
        h2s      = table.find("tr")[1].children; // custom heading

    // conflict : dom object
    // custom the title and combine two line to one line title
    h1s.forEach(function (heading, index) {   // get the 1st rows get the column title
        if (index < 1) { // exclude first title
            // log("h1s : ", h1s)
            log("heading : ", heading)
            log("heading text : ", heading.text)
            // headings.push(heading.innerText);
            return;
        }
        // headings.push(heading.innerText + "-" + h2s[2 * (index - 1)].innerText, heading.innerText + "-" + h2s[2 * index - 1].innerText);
    });

    // return arrayify(table.tBodies[0].rows, [2, -2]).map(factory(headings)); // extract the content
}
*/


module.exports.init = init;
