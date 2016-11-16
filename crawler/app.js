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

// 生成列表
function database(){
    async.whilst(
        function(){
            return typeof COUNT == "number";
        },
        function(next){
            var _url = "";

            if ( COUNT < 2){
                _url = URL;
            } else {
                _url = URL_Prefix + COUNT + ".html"
            }
            debug("url : ", _url);
            request(_url, function(err, res, body){
                if (res.statusCode && res.statusCode == 200){
                    var $ = cheerio.load(body),
                        lists = $(".service");

                    lists.each(function(i, v){
                        LIST.push(v.attribs.href)
                    });

                    COUNT++;
                    next()
                } else {
                    fs.writeFile('./crawler/data/database.json', JSON.stringify({ "list" : LIST}), function (err) {
                        if (err) throw err;
                        console.log('遍历存储所有数据');
                    });
                    COUNT = "end";
                }
            });
        }
    )
}

function format(){
    var DATA,
        TIME = [],
        ESTATE_GuanGu = [],
        ESTATE_Total = [],
        RESULTS = {};

    async.series([
        function(done){
            fs.readFile('./crawler/data/estate.json','utf8', function (err, data) {
                if (err) throw err;
                DATA =  JSON.parse(data)

                for(var key in DATA){
                    TIME.push(key);
                    ESTATE_GuanGu.push(DATA[key][0])
                    ESTATE_Total.push(DATA[key][1])
                }

                RESULTS = {
                    "time" : TIME,
                    "guangu" : ESTATE_GuanGu,
                    "total" : ESTATE_Total
                };

                done();
            })
        },

        function(done){
            fs.writeFile('./crawler/data/estate_format.json', JSON.stringify(RESULTS), function (err) {
                if (err) throw err;
                console.log('格式化了所有数据');
            });

        }
    ], function(err){
        debug("格式化队列完成");
    });


}


function init(){
    var DATA = [];

    async.series([
        // read database
        function(done){
            fs.readFile('./crawler/data/database.json','utf8', function (err, data) {
                if (err) throw err;
                DATA =  JSON.parse(data).list;
                debug("init read database '读取所有数据' : ", DATA.slice(0,10));
                done()
            });
        },

        // traverse and read data
        function(done){
            async.eachSeries(Object.keys(DATA), function(index, next){
                getData(DATA[index], next)
            }, done);
        },

        // output result to local json
        function(done){
            debug(RESULTS);
            fs.writeFile('./crawler/data/estate.json', JSON.stringify(RESULTS), function (err) {
                if (err) throw err;
                console.log('存储了所有数据');
            });
        }

    ],function(err){
        if (err) console.error(err.stack);

        console.log('完成队列');

    });
}

function savePRICEDATA(callback){
    log = debug("SAVE PRICE DATA : ");
    callback && callback();
    return;
    fs.writeFile(PATH.pricedata, JSON.stringify(PRICEDATA), function (err) {
        if (err) throw err;
        log('存储了所有数据');
        callback()
    });
}

getListInit(URL);

/*
* getList的启动函数
* */
function getListInit(url) {
    log = debug("Get LIST init")

    var _existItem = true,
        _n = 2,
        _base = URL.split(".html")[0];;

    async.whilst(
        function() {
            log("while", _existItem)
            return _existItem
        },
        function(callback){
            log("list init")
            log("...", url);
            getList(url, function(){
                log("-------Exit--------------------------")
                _existItem = false; // 有重复项
                savePRICEDATA(); // 依赖updateDataSet
            }, callback);
            url = _base + "_" + _n + ".html";
            ++_n;
        },
        function(err){
            log(err)
        }
    )
}

function getList(url, callback, next) {
    log = debug("getList : ");
    log("getList start..");

    request(url, function(err, res, body){
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(body);

            $(".service").each(function(){
                var _item = $(this),
                    _time = _item.parent().next().text(),
                    _url = _item.attr("href");

                log(PRICEDATA[_time])
                // 已经有的数据，立即中止
                if ( !!PRICEDATA[_time] ) {
                    log("Finished")
                    callback();
                    return;
                }
                // 获取数据，更新数据
                getData(_url, function(data){
                    log(data)
                    PRICEDATA[_time] = data;
                });

                // 给3秒抓新闻页的内容
                setTimeout(function(){
                    next && next()
                }, 3000)
            });
        } else {
            log("getlist error..")
        }
    })
}

/*
* 获取列表中标题项的具体内容
* @param title {object} 标题项
* @param callback {function} 下一步执行的函数
* */
function readTitle(item, callback){
    if ( !item ) return ;
     var _time = item.parent().next().text(),
         _url = item.attr("href");


    if( !PRICEDATA[_time] ) {

    }
}


/*
* 读取url列表里最新更新的一条数据的时间
* */
function readLatestUrlDate(){
    log = debug("readLatestUrlDate : ");
    log("readLatestUrlDate start..");

    return Object.keys(PRICEDATA)[0]
}

/*
* 初始化价格数据库
* */
function initPriceData(){
    return fs.readFileSync(PATH.pricedata,'utf8');
}

function getData(url, callback){
    var log = debug("getData : ");
    log(url)
    request("http://scxx.whfcj.gov.cn/" + url, function(err, res, body){
        if (res.statusCode && res.statusCode == 200) {
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

        }
    })
}