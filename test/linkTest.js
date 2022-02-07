const { chai, server, assert, should } = require('./testConfig');

// Get Link Token test
describe('/GET /api/link/create', () => {
    // Get a link token
    it('It should get a Plaid link token', (done) => {
        // First login and get token
        const loginPayload = {email: 'test@gmail.com', password: 'pass'};
        chai.request(server).post('/api/users/authenticate').send(loginPayload).end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.key("token");
            let token = res.body.token;
            // Now hit create endpoint using token
            chai.request(server).get('/api/link').set('Authorization', 'Bearer ' + token).end((err2, res2) => {
                res.should.have.status(200);
                res.body.should.have.key("token");
                done();
            });
        });
    });
});

// Exchange public token for access token test
// Insert here
