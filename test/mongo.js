var db = require("../crawler/database/mongo"),
    expect = require("chai").expect;

describe("mongo", function(){
    it('connect work right', function(){
        db.connection(function(db){
            expect(db).to.eql(true);
        })
    });
    it('findLatest', function(){
        db.findLatest(function(db){
            expect(db).to.eql(true);
        })
    });
});
