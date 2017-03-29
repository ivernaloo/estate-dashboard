var debug      = require('debug'),
    cheerio    = require('cheerio'),
    request    = require('request'),
    fs         = require('fs'),
    async      = require('async'),
    URL        = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html",
    URL_Prefix = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_",
    COUNT      = 1,
    LIST       = [],
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
    var url = URL;
    var log = debug("init");

    var _exist = false,
        _n     = 2,
        _base  = URL.split(".html")[0];

    async.whilst(
        function () {
            return !_exist
        },
        function (callback) {
            // parse the url
            getList(url, function (result) {
                _exist = result;
            }, callback);

            url = _base + "_" + _n + ".html";

            debug("parse url result : ", url);
            ++_n;
        },
        function (err) {
            saveData(finalTask);
            log(err);
        }
    )
}

// parse the list
function getList(url, callback, next) {
    log = debug("getList : ");
    log("start..");

    request(url, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $      = cheerio.load(body),
                _items = $(".service"), // get the list result
                n      = 1;

            async.detectSeries(_items, function (item, detect) {
                var _item = $(item),
                    _time = _item.parent().next().text(),
                    _url  = _item.attr("href");

                log(_url);
                // 获取数据，更新数据
                // parse the data item page
                getData(_url, function (data) {

                    // through detect feature to continue the async series
                    // #fixed #bug 如果这一天发了两个通知，就返回结束标识符了。
                    // check the status only there is a return data
                    if (data){
                        detect(!!PRICEDATA[_time]); // have no this data
                        PRICEDATA[_time] = data;
                    } else {
                        detect(false); // no data return and continue the async series
                    }
                });

            },
            function (result) {
            // result
            // 没有detect到就是null
            // detect到了就是true
            log("jump out from getData", result);
            next && next();

            callback(result)
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

function getData(url, callback) {
    var log = debug("getData : ");

    request("http://scxx.whfcj.gov.cn/" + url, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(body, {
                decodeEntities: false
            });

            var Table = [],
                trs = $("#artibody tr");

            trs.each(function () {
                var ROW = [];
                var tdDATA = $(this).find('td');
                if (tdDATA.length > 0) {
                    tdDATA.each(function () {
                        ROW.push($(this).text())
                    })
                    Table.push(ROW);
                }
            });
            // Time
            Table = Table.slice(2, -1);

            Table.forEach(function (v, i) {
                Table[i] = Table[i].slice(1, -1);
            });


            if (callback) {
                if(Table.length > 0){
                    callback([Table[8][0], Table[15][0]])
                } else {
                    callback();
                }

            } else {
                // 光谷的数据和总数据
                RESULTS[
                    $("td:contains('201')")[3].children[0].data.match(/\d{4}\/\d{2}\/\d{2}/)[0]
                    ] = [
                    Table[8][0],
                    Table[15][0]
                ];
            }
        } else {
            log("request error")
        }
    })
}

module.exports.init = init;
