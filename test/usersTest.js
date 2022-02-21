const { chai, server } = require('./testConfig');
const mongoDBConnection = require('../mongoDBConnection');
const { ObjectId } = require('mongodb');

// Hello World Test
describe('/GET /', () => {
  it('It should output "Hello World"', (done) => {
    chai.request(server).get('/').end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.message.should.equal('Hello World');
      done();
    });
  });
});

// User register test
describe('/POST /api/users/register', () => {
  const registerTestPayload = { auth: { email: 'test@gmail.com', password: 'password' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
  // Validates inserting a user document into database
  it('200: It should register a user', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      mongoDBConnection.get().collection('LanternUsers').find({ _id: ObjectId(res.body._id) }).toArray((e, docs) => {
        docs.should.have.lengthOf(1);
        docs[0].should.have.property('_id');
        (docs[0]._id.toString()).should.equal(res.body._id);
      });
      res.should.have.status(201);
      done();
    });
  });

  const registerBadPassTestPayload = { auth: { email: 'test@gmail.com', password: 'pass' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
  it('400: It should detect invalid password', (done) => {
    chai.request(server).post('/api/users/register').send(registerBadPassTestPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(400);
      done();
    });
  });

  // Validates duplicate email condition
  it('400: Emails should be unique per account', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(400);
      res.body.message.should.equal('Email already in use');
      done();
    });
  });
});

// User login test
describe('/POST /api/users/authenticate', () => {
  const loginPayload = { email: 'test@gmail.com', password: 'password' };
  // Validates logging in user
  it('200: It should log in a user (grant JWT)', (done) => {
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      done();
    });
  });

  const incorrectPasswordPayload = { email: 'test@gmail.com', password: 'incorrectPass' };
  // Validates incorrect password error
  it('401: It should give an invalid password error', (done) => {
    chai.request(server).post('/api/users/authenticate').send(incorrectPasswordPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      res.body.should.have.property('message');
      done();
    });
  });

  const incorrectLoginPayload = { email: 'incorrect@gmail.com', password: 'someIncorrectPass' };
  // Validates incorrect email/password error
  it('401: It should give an invalid password error', (done) => {
    chai.request(server).post('/api/users/authenticate').send(incorrectLoginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      res.body.should.have.property('message');
      done();
    });
  });
});

// User update test
describe('/POST /api/users/update', () => {
  // Validates inserting a user document into database
  const registerTestPayload2 = { auth: { email: 'test2@gmail.com', password: 'password' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
  const updateTestPayload = { first: 'John', last: 'Appleseed', orgName: 'Lantern' };
  it('200: It should update document in database', (done) => {
    chai.request(server).post('/api/users/register').send(registerTestPayload2).end((err, res) => {
      if (err) {
        console.log(err);
      }
      chai.request(server).post('/api/users/update').set('Authorization', 'Bearer ' + res.body.token).send(updateTestPayload).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
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

  it("401: Shouldn't accept no token", (done) => {
    chai.request(server).post('/api/users/update').send(updateTestPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      res.body.should.have.property('message');
      done();
    });
  });

  it("403: Shouldn't accept invalid token", (done) => {
    chai.request(server).post('/api/users/update').set('Authorization', 'Bearer invalid_token').send(updateTestPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(403);
      done();
    });
  });


});
