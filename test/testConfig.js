// Change enviroment to test
process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server")

chai.use(chaiHttp)
let assert = require("chai").assert;
let should = chai.should();

module.exports = {
    chai: chai,
    server: server,
    assert : assert,
	should: should
};