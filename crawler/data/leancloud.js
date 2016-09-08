var request = require('request');
var Store_Lcloud_ScrapeResource = 'https://api.leancloud.cn/1.1/classes/estates';
var _Store_Lcloud_ScrapeResource = '/1.1/classes/estates/';
var Store_Lcloud_Base = 'https://api.leancloud.cn/1.1/';
var Store_Lcloud_Batch = "https://api.leancloud.cn/1.1/batch";
var async = require('async');

var Lcloud = {
    'X-LC-Id': "lvwj1mpo0ikouhkwl956kwqbnegzj9y5nh6ybs4qx2vmyc4z",
    'X-LC-Key': "fhkv9jj22qsvmfmhtkj84mxzn5oytuw8fpb9vkywz9docpet"
};

var QueryString = {
    order: "-updatedAt"
};

// record the data
function record(data, callback) {
    request.post({
        headers: Lcloud,
        url: Store_Lcloud_Batch,
        body: data,
        json: true
    }, function (err, res, body) {
        if (res.statusCode === 200) {
            console.log("记录数据成功");
            callback && callback(); // 执行回调
        }
    });
};

function getAllData(done) {
    var LIST = [],
        COUNT = 0;

    async.whilst(
        function () {
            return typeof COUNT == "number"; // COUNT一直增加，到一定值时赋值为"end"跳出。
        },
        function (next) {
            getListByPage(COUNT).then(
                function (res) {
                    if (res.length && res.length > 0) {
                        LIST = LIST.concat(res);
                        console.log(COUNT, "组，加载ing");
                        COUNT++;
                        next();
                    } else {
                        COUNT = "end";
                        done(LIST);
                    }
                },
                function (error) {
                    console.log("获取所有数据似乎有些问题！ " + error);
                }
            );
        }
    )
}

// 拿到一页的所有数据
function getListByPage(id) {
    if (!id) {
        // QueryString.skip = 100*id;
        id = 0;
    }
    return new Promise(function (resolve, reject) {
        request({
            headers: Lcloud,
            url: Store_Lcloud_ScrapeResource,
            method: "GET",
            qs: {
                order: "-updatedAt",
                skip: 100 * id
            },
            useQuerystring: true
        }, function (err, res, body) {
            if (res && res.statusCode && res.statusCode === 200) {
                console.log("getListByPage - 数据获取正确");
                return resolve(JSON.parse(res.body).results);
            } else {
                reject("Error: Some troubles on getListByPage");
            }
        })
    });
};

/*
 * sample data : http://www.0daydown.com/08/606874.html
 * checkExist("http://www.0daydown.com/08/606874.html");
 * */
function checkExist(url, callback) {
    if (!url) return;
    var _url = 'https://api.leancloud.cn/1.1/classes/crawler?where={"url":"' + url + '"}',
        _results = [],
        flag;

    request({
        headers: Lcloud,
        url: _url,
        method: "GET"
    }, function (err, res, body) {
        if (res.statusCode === 200) {
            _results = JSON.parse(res.body).results;

            // detect the number of items
            if (_results.length > 1) {
                console.log("_results : ", _results);
                console.log("Length : ", _results.length);
                _results.splice(1).forEach(function (v, i) {
                    deleteItem(v.objectId, function () {
                        callback(true);
                    }); // 删除重复的列表
                });

            } else {
                callback(false);
            }
        } else {
            throw SQLException("checkExist failure");
        }
    });
};

function deleteItem(id, callback) {
    request.del({
        headers: Lcloud,
        url: Store_Lcloud_ScrapeResource + "/" + id
    }, function (err, res, body) {
        if (res.statusCode === 200) {
            console.log("删除数据" + id + "成功");
            callback && callback();
        }
    });
}

exports.record = record;
exports.getListByPage = getListByPage;
exports.checkExist = checkExist;
exports.getAllData = getAllData;
