var debug      = require('debug'),
    config     = require("config"),
    cheerio    = require('cheerio'),
    request    = require('request'),
    fs         = require('fs'),
    async      = require('async'),
    URL        = config.get("crawler.url"),
    parseTableData = require("./parseTable").parseTable,
    RESULTS    = {},
    PATH       = {
        "urldatabase": "./crawler/data/database.json",
        "pricedata"  : "./crawler/data/estate.json"
    },
    PRICEDATA  = JSON.parse(initPriceData()),
    log;

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
            var $      = cheerio.load(body),
                items = $(".service"), // get the list result
                n      = 1;

            // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
            items.each(function(i, elem){
                var url = $(elem).attr("href"),
                    date = $(elem).text().replace(/\D+/g, " ").split(" ").slice(0,3).join("/");
                if(i>0) return; // test
                parseTable(url, function(data){
                    log("parseTable : ",data,date);
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

function parseTable(url, callback) {
    var log = debug("parseTable : "),
        base = config.get("crawler.base");

    request(base + url, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(body, {
                decodeEntities: false
            });

            var Table = $($("#artibody > p").html());
            log(parseTableData(Table))

        } else {
            log("request error")
        }
    })
}

module.exports.init = init;
