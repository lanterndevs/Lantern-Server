const { chai, server } = require('./testConfig');
const plaid = require('../plaidConnection');

// Get Link Token test
describe('/GET /api/link', () => {
  // Get a link token
  it('It should get a Plaid link token', (done) => {
    // First login and get token
    const loginPayload = { email: 'test@gmail.com', password: 'pass' };
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
        res.should.have.status(200);
        res.body.should.have.property('token');
        done();
      });
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
  });

  it('It should exchange public_token for access_token', (done) => {
    // First login and get client token
    const loginPayload = { email: 'test@gmail.com', password: 'pass' };
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
        res.should.have.status(200);
        res.body.should.have.property('token');
        done();
      });
    });
  });
});
