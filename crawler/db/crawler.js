var debug = require('debug'),
    cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs'),
    async = require('async'),
    URL = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html",
    URL_Prefix  = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_",
    COUNT = 1,
    LIST = [],
    RESULTS = {},
    PATH = {
        "urldatabase" : "./crawler/data/database.json",
        "pricedata" : "./crawler/data/estate.json"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log;


getListInit(URL);

function savePRICEDATA(){
    log = debug("SAVE PRICE DATA : ");
    fs.writeFile(PATH.pricedata, JSON.stringify(PRICEDATA), function (err) {
        if (err) throw err;
        log('存储了所有数据');
    });
}

/*
* getList的启动函数
* */
function getListInit(url) {
    log = debug("Get LIST init")

    var _existItem = false,
        _n = 2,
        _base = URL.split(".html")[0];;

    async.whilst(
        function() {
            log("while", _existItem)
            return !_existItem
        },
        function(callback){
            log("list init")
            log("...", url);
            getList(url, function(result){
                log("_existItem : ", result);
                _existItem = result;
            },callback);
            url = _base + "_" + _n + ".html";
            ++_n;
        },
        function(err){
            log("whilist end -----------------------");
            savePRICEDATA();
            log(err);
        }
    )
}

function getList(url, callback, next) {
    log = debug("getList : ");
    log("getList start..");

    request(url, function(err, res, body){
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(body),
                _items = $(".service"),
                n = 1;


            async.detectSeries(_items, function(item ,detect){
                var _item = $(item),
                    _time = _item.parent().next().text(),
                    _url = _item.attr("href");

                // 获取数据，更新数据
                getData(_url, function(data){

                    // 已经有的数据，立即中止
                    detect(!!PRICEDATA[_time]);
                    PRICEDATA[_time] = data;
                });

            }, function(result){
                // result
                // 没有detect到就是null
                // detect到了就是true
                log("跳出getItmes", result);
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
function initPriceData(){
    return fs.readFileSync(PATH.pricedata,'utf8');
}

function getData(url, callback){
    var log = debug("getData : ");
    request("http://scxx.whfcj.gov.cn/" + url, function(err, res, body){
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(body,{
                decodeEntities: false
            });
            var Table = [];
            $("#artibody tr").each(function(){
                var ROW = [];
                var tdDATA = $(this).find('td');
                if ( tdDATA.length > 0 ) {
                    tdDATA.each(function(){
                        ROW.push($(this).text())
                    })
                    Table.push(ROW);
                }
            });
            // Time
            Table = Table.slice(2,-1);

            Table.forEach(function(v,i){
                Table[i] = Table[i].slice(1, -1);
            });


            if ( callback ){
                callback([Table[8][0],Table[15][0]])
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
            log("error")
        }
    })
}