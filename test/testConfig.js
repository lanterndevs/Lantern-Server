// Change enviroment to test
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')

chai.use(chaiHttp)
const assert = require('chai').assert
const should = chai.should()

module.exports = {
  chai: chai,
  server: server,
  assert: assert,
  should: should
}
