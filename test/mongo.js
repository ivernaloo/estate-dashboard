var db = require("../crawler/database/mongo"),
    expect = require("chai").expect;

describe("dababase", function(){
    it('connection work right', function(done){
        var url = "mongodb://10.232.31.105:27017/mongotest";
        this.timeout(10000);
        db.connection(function(err,db){
            expect(err).to.eql(null);
            done();
        }, function(err){

        },{
            url:url
        })
    });



/*    it('connection failure', function(done){
        db.connection(function(db){


        }, function(err,db){
            expect(db).to.eql(null);
            expect(err).to.contain("MongoError");
            done();

        }, {
            url:""
        })
    });

    it('findLatest', function(done){
        db.findLatest(function(latest){
            expect(latest.split("/").length).to.eql(3);
            done();
        })
    });*/
});
