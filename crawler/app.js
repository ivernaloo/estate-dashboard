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
getData()
function getData(){
    var url = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24151.html";
    request(url, function(err, res, body){
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
            Table = Table.slice(2,-1);

            Table.forEach(function(v,i){
                Table[i] = Table[i].slice(1, -1);
            });
            // Time
            debug(Table.slice(-1)[0][1].match(/\d{4}\-\d{2}-\d{2}/)[0])
            // 东湖高新区
            debug(Table)
            // 总计
            debug(Table[8][0])
            debug(Table[15][0])
        } else {

        }
    })
}
