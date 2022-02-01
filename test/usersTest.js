const { chai, server, assert, should } = require('./testConfig');
const mongoDBConnection = require('../mongoDBConnection');
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

// User register test
registerTestPayload = { auth: { email: 'string', password: 'string' }, bio: { first: 'string', last: 'string', orgName: 'string' } };

describe('/POST /api/users/register', () => {
  // Validates inserting a user document into database
  it('It should register a user', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload).end((err, res) => {
      mongoDBConnection.get().collection('LanternUsers').find({ _id: ObjectId(res.body._id) }).toArray((e, docs) => {
        docs.should.have.lengthOf(1);
        docs[0].should.have.property('_id');
        (docs[0]._id.toString()).should.equal(res.body._id);
      });
      res.should.have.status(201);
      res.body.message.should.equal('Welcome ' + registerTestPayload.bio.first);
      done();
    });
  });

  // Validates duplicate email condition
  it('Emails should be unique per account', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload).end((err, res) => {
      res.should.have.status(400);
      res.body.message.should.equal('Email already in use');
      done();
    });
  });
});
