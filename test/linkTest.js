const { chai, server } = require('./testConfig');
const plaid = require('../plaidConnection');
const mongo = require('../mongoDBConnection');

// Get Link Token test
describe('/GET /api/link', () => {
  // Get a link token
  it('200: It should get a Plaid link token', (done) => {
    // First login and get token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const token = res.body.token;
      // Now hit create endpoint using token
      chai.request(server).get('/api/link').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.property('token');
        done();
      });
    });
  });

  it('401: It should reject missing auth token', (done) => {
    // Hit create endpoint using no token
    chai.request(server).get('/api/link').end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      done();
    });
  });

  it('403: It should reject invalid auth token', (done) => {
    // Hit create endpoint using invalid token
    chai.request(server).get('/api/link').set('Authorization', 'Bearer invalidToken').end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(403);
      done();
    });
  });
});

// Exchange public token for access token test
describe('/POST /api/link', () => {
  let publicToken;
  it('It should get a sandbox public token', (done) => {
    const publicTokenRequest = {
      institution_id: 'ins_109508',
      initial_products: [plaid.Products.Transactions, plaid.Products.Auth]
    };
    plaid.client.sandboxPublicTokenCreate(publicTokenRequest).then((result) => {
      result.data.public_token.should.not.equal('');
      publicToken = result.data.public_token;
      done();
    });
  }).timeout(4000);

  it('200: It should exchange public_token for access_token', (done) => {
    // First login and get client token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const clientToken = res.body.token;
      // Now hit exchange payload
      const exchangePayload = { token: publicToken };
      chai.request(server).post('/api/link').set('Authorization', 'Bearer ' + clientToken).send(exchangePayload).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.property('token');
        done();
      });
    });
  });

  it('200: It should replace existing item if it applies to the same financial institution', (done) => {
    // First login and get client token
    const loginPayload = { email: 'test@gmail.com', password: 'password' };
    chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(200);
      res.body.should.have.property('token');
      const clientToken = res.body.token;
      // Now hit exchange payload
      const exchangePayload = { token: publicToken };
      chai.request(server).post('/api/link').set('Authorization', 'Bearer ' + clientToken).send(exchangePayload).end((err2, res2) => {
        if (err2) {
          console.log(err2);
        }
        res2.should.have.status(200);
        res2.body.should.have.property('token');
        // Now ensure only one item in database for user
        mongo.get().collection('LanternUsers').find({ 'auth.email': loginPayload.email }).toArray((e, docs) => {
          docs[0].items.should.have.length(1);
          docs[0].items[0].accessToken.should.equal(res2.body.token);
          done();
        });
      });
    });
  });

  it('401: It should reject missing auth token', (done) => {
    // Hit create endpoint using no token
    const exchangePayload = { token: publicToken };
    chai.request(server).post('/api/link').send(exchangePayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(401);
      done();
    });
  });

  it('403: It should reject invalid auth token', (done) => {
    // Hit create endpoint using invalid token
    const exchangePayload = { token: publicToken };
    chai.request(server).post('/api/link').set('Authorization', 'Bearer invalidToken').send(exchangePayload).end((err, res) => {
      if (err) {
        console.log(err);
      }
      res.should.have.status(403);
      done();
    });
  });
});
