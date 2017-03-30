var MongoCli = require("mongodb").MongoClient
    , assert = require('assert');

// connection url
var url = 'mongodb://birdeye.imwork.net:27017/mongotest';
MongoCli.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("connected correctly to server");


    insertDocuments(db, console.log)
    db.close();
});

var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the document collection");
        callback(result);

        /*
        *
         connected correctly to server
         Inserted 3 documents into the document collection
         { result: { ok: 1, n: 3 },
         ops:
         [ { a: 1, _id: 58dd12d836745c3258d480c4 },
         { a: 2, _id: 58dd12d836745c3258d480c5 },
         { a: 3, _id: 58dd12d836745c3258d480c6 } ],
         insertedCount: 3,
         insertedIds:
         [ 58dd12d836745c3258d480c4,
         58dd12d836745c3258d480c5,
         58dd12d836745c3258d480c6 ] }
        *
        * */
    });
}

