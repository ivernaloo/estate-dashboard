var debug = require('debug')('crawler'),
    cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs'),
    async = require('async'),
    URL = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html",
    URL_Prefix  = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_",
    COUNT = 1,
    LIST = [],
    RESULTS = {};

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

function getData(url, next){
    debug("getData url : ", url);
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


            RESULTS[
                    $("td:contains('201')")[3].children[0].data.match(/\d{4}\/\d{2}\/\d{2}/)[0]
                   ] = [
                Table[8][0],
                Table[15][0]
            ];

            next()
        } else {

        }
    })
}

init();