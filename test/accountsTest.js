const { chai, server } = require('./testConfig');

// Get accounts test
describe('/GET /api/accounts', () => {
  it('200: It should get all accounts for a given user', (done) => {
    // First login and get token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit accounts endpoint using token
      chai.request(server).get('/api/accounts').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.lengthOf.above(0);
        done();
      });
    });
  }).timeout(4000);

  it('400: It should refuse request if user has no Plaid Items', (done) => {
    // Login user with no Plaid items
    const loginPayload = { email: 'test2@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit accounts endpoint using token
      chai.request(server).get('/api/accounts').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(400);
        res2.body.should.have.property('message');
        done();
      });
    });
  });

  it('401: It should refuse request if no token is provided', (done) => {
    // Hit accounts endpoint with no token
    chai.request(server).get('/api/accounts').end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      done();
    });
  });

  it('403: It should refuse request if invalid token is provided', (done) => {
    // Hit accounts endpoint with no token
    chai.request(server).get('/api/accounts').set('Authorization', 'Bearer: invalidToken').end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(403);
      done();
    });
  });
});
