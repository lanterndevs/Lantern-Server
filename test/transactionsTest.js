const { chai, server } = require('./testConfig');

// Get transactions test
describe('/GET /api/transactions', () => {
  it('It should get all transactions for a given users accounts', (done) => {
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
});