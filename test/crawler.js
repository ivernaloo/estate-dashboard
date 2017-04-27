var crawler = require("../crawler/app/crawler"),
    expect = require("chai").expect;

describe("Utils", function(){
    it('checkLatest : compare item whether need be updated', function(){
        expect(crawler.checkLatest("2011/10/11","2011/10/10")).to.eql(true);

        expect(crawler.checkLatest("2011/10/11",0)).to.eql(true);
    });
});

