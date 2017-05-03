var db = require("../crawler/database/mongo"),
    expect = require("chai").expect;

describe("dababase connection", function () {
    it('connection work right', function(done){
        var url = "mongodb://114.215.139.174:27017/mongotest";
        this.timeout(5000);
        db.connection(function(err,db){
            expect(err).to.eql(null);
            done();
        },{
            url:url
        })
    });
});

describe("database manipulate", function () {
    it('insertDocuments', function (done) {
        db.insertDocuments([
            {"no": 1, "date": 2},
            {"no": 2, "date": 3}
        ], function (err, res) {
            expect(err).to.equal(null);
            done();
        })
    });
})
