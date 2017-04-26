var MongoCli = require("mongodb").MongoClient,
    config   = require("config"),
    debug    = require("debug"),
    URL      = config.get("crawler.database");


/*
* connect logic
* @param {function} connection function
* @param {function} disconnect function
* */
function connection(connect, disconnect) {
    var log = debug("connection : ");

    log(URL)
    // connection url
    MongoCli.connect(URL, function (err, db) {
        log("connection status : ", err);
        connect(db);

        if (err) {
            log(" connection error ");
            return;
        }
        ;
    });
}

/*
* insert many documents
* @param {Array} save data set
* */
function insertDocuments(data, callback) {
    var log = debug("insertDocuments : ");
    connection(
        function (db) {
            // Get the documents collection
            var collection = db.collection('documents');
            // Insert some documents
            collection.insertMany(data, function (err, result) {
                // log(err, result);
            }, function (res) {
                log("insert document end");
                db.close();
            });
        }
    )

}

/*
* find duplicate list
* */
function findDeduplicate() {
    var log = debug("findDeduplicate : ");
    connection(
        function (db) {
            // Get the documents collection
            var collection = db.collection('documents');
            // remove duplicate documents
            collection.aggregate(
                {
                    $group: {
                        _id  : {date: "$date"},
                        count: {$sum: 1},
                        docs : {$push: "$_id"}
                    }
                },
                {
                    $match: {
                        count: {$gt: 1}
                    }
                }
            );
        }
    )

}

/*
* remove duplicate items
* */
function removeDeduplicate() {
    var log = debug("removeDeduplicate : ");
    connection(
        function (db) {
            // Get the documents collection
            var collection = db.collection('documents');
            // remove duplicate documents
            collection.find({}, {date: 1})
                .sort({_id: 1})
                .forEach(function (doc) {
                    collection.remove({_id: {$gt: doc._id}, date: doc.date})
                });
        }
    )

}


var updateDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({a: 2}
        , {$set: {b: 1}}, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};


var deleteDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.deleteOne({a: 3}, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document with the field a equal to 3");
        callback(result);
    });
};

function findDocuments(query, callback) {
    var log = debug("findDocuments : ");
    connection(function (db) {
        // Get the documents collection
        var collection = db.collection('documents');
        // Find some documents
        collection.find(query).toArray(function (err, docs) {

            log("Found the following records");
            log(docs);
            callback && callback(docs);
        });
    });

}

/*
 * @param {function} callback, and pass the lastest into the function
 * */
function findLatest(callback) {
    var log = debug("findLatest : ");
    log("start");
    connection(function (db) {
        // Get the documents collection
        var collection = db.collection('documents');
        // Find latest
        collection.find().sort({"timestamp": -1}).limit(1).toArray(function (err, items) {
            items[0] ? callback(items[0]["date"]) : callback(0);
        });
    });

}


/*
* @done build district collection
* @todo data lose problem 1937-2017
* @todo date sort problem
* @todo fix value problem : maybe caused by repeat mapreduce
* {
    "_id" : "2017/4/8",
    "value" : {
        "2017/4/8" : [
            "10",
            "10",
            "10"
        ]
    }
}
* @todo build response collecton to serval district
*
* */
function buildDistrictCollection(){
    var log = debug("buildDistrictCollection : ");

    connection(function (db) {
        // Get the documents collection
        var collection = db.collection('documents');
        // Find latest
        collection.mapReduce(
            function () {
                var _t = this;
                _t.data.forEach(function (item, index) {
                    if (item["区域"] == "东湖高新区") {
                        emit(_t.date, item["商品住房-成交套数"])
                    }
                })
            },
            function (date, number) {
                var result = {};
                result[date] = number;
                return result;
            },
            {
                out: { replace : "map_reduce7" },
                verbose : true
            },
            function(err, collection, stats){
                log(err);
                collection.find({}).explain(function(err, docs){
                    log(stats);
                    db.close();
                });
            }
        )
    });
}

/*
* @done Query district estate data
*
* @param {string}
* @return
* {
*   "district" : "东湖高新区"
*   data : [
*       "2017/04/01":1231,
*       "2017/04/02":1231,
*       "2017/04/03":1231,
*       "2017/04/04":1231
*   ]
* }
* */
function queryDistrict() {
    var log = debug("queryDistrict : ");
    connection(function (db) {
        // Get the documents collection



        db.eval(function() {
            var collection = db.collection('map_reduce7');
            return collection.find().toArray().sort(function(doc1, doc2) {
                return Date.parse(doc2._id) - Date.parse(doc1._id);
            })
        });
        /*// Find latest
        collection.find().toArray(function(errs, docs){
            // the last sort date
            log(docs.sort(
                function(v1,v2){
                    return Date.parse(v2._id) - Date.parse(v1._id)
                }));
        })
        */
    });

}

module.exports.insertDocuments = insertDocuments;
module.exports.findDocuments = findDocuments;
module.exports.findLatest = findLatest;
module.exports.queryDistrict = queryDistrict;
module.exports.buildDistrictCollection = buildDistrictCollection;
