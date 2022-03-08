const { chai, server } = require('./testConfig');

// Get transactions test
describe('/GET /api/transactions', () => {
  it('200: It should get all transactions for a given users accounts', (done) => {
    // First login and get token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit transactions endpoint using token
      chai.request(server).get('/api/transactions').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.lengthOf.above(0);
        done();
      });
    });
  }).timeout(0);

  it('200: It should get all transactions in the specified date range with offset', (done) => {
    // First login and get token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit transactions endpoint using token and SPECIFYING DATE RANGE
      chai.request(server).get('/api/transactions').set('Authorization', 'Bearer ' + token)
          .query({
            start_date: "2021-03-01",
            end_date: "2022-01-01",
            offset: 1
          }).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.lengthOf.above(0);
        done();
      });
    });
  }).timeout(0);

  it('400: It should refuse if user has no valid Plaid items in account!', (done) => {
    // First login and get token
    const loginPayload = { email: 'test2@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit transactions endpoint using token
      chai.request(server).get('/api/transactions').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(400);
        res2.body.should.have.property('message');
        done();
      });
    });
  }).timeout(0);

  it('401: It should refuse if no token is given!', (done) => {
    // Hit transactions endpoint using no
    chai.request(server).get('/api/transactions').end((err2, res2) => {
      if (err2) {
        console.log(err2);
      }
      res2.should.have.status(401);
      done();
    });
  });

  it('403: It should refuse if invalid token is given!', (done) => {
    // Hit transactions endpoint using no
    chai.request(server).get('/api/transactions').set('Authorization', 'Bearer invalidToken').end((err2, res2) => {
      if (err2) {
        console.log(err2);
      }
      res2.should.have.status(403);
      done();
    });
  });
});
