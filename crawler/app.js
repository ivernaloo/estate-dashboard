var debug = require('debug')('crawler'),
    cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs'),
    async = require('async'),
    URL = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html",
    URL_Prefix  = "http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_",
    COUNT = 1,
    LIST = [];



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
                fs.writeFile('./crawler/data/database.json', JSON.stringify(LIST), function (err) {
                    if (err) throw err;
                    console.log('遍历存储所有数据');
                });
                COUNT = "end";
            }
        });
    }
)