const { chai, server, assert, should } = require('./testConfig');
const mongoDBConnection = require('../mongoDBConnection');
const plaidConnection = require('../plaidConnection');
const { ObjectId } = require('mongodb');

// Hello World Test
describe('/GET /', () => {
    it('It should output "Hello World"', (done) => {
        chai.request(server).get('/').end((err, res) => {
            res.should.have.status(200);
            res.body.message.should.equal('Hello World');
            done();
        });
    });
});

// Get Link Token test
describe('/GET /api/link/create', () => {
    // Get a link token
    it('It should get a Plaid link token', (done) => {
        const loginPayload = {email: 'test@gmail.com', password: 'pass'};
        // First login and get token
        // Then hit create endpoint using token
        // Make sure link token is obtained
        chai.request(server).get('/api/link/create').set('Authorization', 'Bearer ' + res.body.token).end((err, res) => {
            mongoDBConnection.get().collection('LanternUsers').find({ _id: ObjectId(res.body._id) }).toArray((e, docs) => {
                docs.should.have.lengthOf(1);
                docs[0].should.have.property('_id');
                (docs[0]._id.toString()).should.equal(res.body._id);
            });
            res.should.have.status(201);
            done();
        });
    });
});
