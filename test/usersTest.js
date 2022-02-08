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
describe('/POST /api/users/register', () => {
  const registerTestPayload = { auth: { email: 'test@gmail.com', password: 'pass' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
  // Validates inserting a user document into database
  it('It should register a user', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload).end((err, res) => {
      mongoDBConnection.get().collection('LanternUsers').find({ _id: ObjectId(res.body._id) }).toArray((e, docs) => {
        docs.should.have.lengthOf(1);
        docs[0].should.have.property('_id');
        (docs[0]._id.toString()).should.equal(res.body._id);
      });
      res.should.have.status(201);
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

// User login test
describe('/POST /api/users/authenticate', () => {
  const loginPayload = { email: 'test@gmail.com', password: 'pass' };
  // Validates logging in user
  it('It should log in a user (grant JWT)', (done) => {
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("token");
      done();
    });
  });

  const incorrectPasswordPayload = { email: 'test@gmail.com', password: 'incorrectPass' }
  // Validates incorrect password error
  it('It should give an invalid password error', (done) => {
    chai.request(server).post('/api/users/authenticate').send(incorrectPasswordPayload).end((err, res) => {
      res.should.have.status(401);
      res.body.should.have.property("message");
      done();
    });
  });

  const incorrectLoginPayload = { email: 'incorrect@gmail.com', password: 'someIncorrectPass' }
  // Validates incorrect email/password error
  it('It should give an invalid password error', (done) => {
    chai.request(server).post('/api/users/authenticate').send(incorrectLoginPayload).end((err, res) => {
      res.should.have.status(401);
      res.body.should.have.property("message");
      done();
    });
  });
});

// User update test
describe('/POST /api/users/update', () => {
  // Validates inserting a user document into database
  const registerTestPayload2 = { auth: { email: 'test2@gmail.com', password: 'pass' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
  const updateTestPayload = { first: 'John', last: 'Appleseed', orgName: 'Lantern' };
  it('It should update document in database', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload2).end((err, res) => {
      chai.request(server).post('/api/users/update').set('Authorization', 'Bearer ' + res.body.token).send(updateTestPayload).end((err, res2) => {
        mongoDBConnection.get().collection('LanternUsers').find({ _id: ObjectId(res.body._id) }).toArray((e, docs) => {
          docs.should.have.lengthOf(1);
          docs[0].bio.first.should.equal(updateTestPayload.first);
        });
        res2.body.message.should.equal('Database Updated');
        res2.should.have.status(200);
        done();
      });
    });
  });

  // Validates duplicate email condition
  it("Shouldn't accept valid token", (done) => {
    chai.request(server).post('/api/users/update').set('Authorization', 'Bearer invalid_token').send(updateTestPayload).end((err, res) => {
      res.should.have.status(403);
      done();
    });
  });
});
