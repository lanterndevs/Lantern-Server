require('dotenv').config();
const { chai, server, assert } = require('./testConfig');
const mongoDBConnection = require('../mongoDBConnection');
const { ObjectId } = require('mongodb');
const loadtest = require('loadtest');

const serveraddr = "http://localhost:"+process.env.SERVER_PORT;

describe('Performance Test /', () => {
    it('Should have latency below 500ms"', (done) => {
        const options = {
            "url": serveraddr+'/',
            "maxSeconds": 5,
            "concurrency": 25,
            "statusCallback": statusCallback
        };
        let gLatency;
        function statusCallback(error, result, latency) {
            gLatency = latency;
        }

        const operation = loadtest.loadTest(options, function(error) {
            if (error) {
              console.error('Got an error: %s', error);
            } else if (operation.running == false) {
                console.log("mean latency is " + gLatency.meanLatencyMs);
                assert(gLatency.meanLatencyMs <= 500, 'Mean latency greater than 500ms');
                done();
           }
        });
    });
  });



describe('Performance Test /api/users/register', () => {
    it('Should have latency below 500ms"', (done) => {
        let id = 0;
        const registerTestPayload = { auth: { email: 'test@gmail.com', password: 'password' }, bio: { first: 'Johnny', last: 'Appleseed', orgName: 'Lantern' } };
        const options = {
            "url": serveraddr+'/api/users/register',
            "method": "POST",
            "body": {},
            "maxSeconds": 5,
            "concurrency": 50,
            "statusCallback": statusCallback,
            requestGenerator: (params, options, client, callback) => {
                id += 1;
                registerTestPayload.auth.email = "test" + id.toString() + "@gmail.com";
                options.body = registerTestPayload;
                const request = client(options, callback);
                return request;
            }
        };
        let gLatency2;
        function statusCallback(error, result, latency) {
            gLatency2 = latency;
        }

        const operation = loadtest.loadTest(options, function(error) {
            if (error) {
                console.error('Got an error: %s', error);
            } else if (operation.running == false) {
                console.log("mean latency is " + gLatency2.meanLatencyMs);
                assert(gLatency2.meanLatencyMs <= 500, 'Mean latency greater than 500ms');
                done();
            }
        });
    });
});

describe('Performance Test /api/users/authenticate', () => {
    it('Should have latency below 500ms"', (done) => {
        const loginTestPayload = { email: 'test0@gmail.com', password: 'password' };
        const options = {
            "url": serveraddr+'/api/users/authenticate',
            "method": "POST",
            "body": loginTestPayload,
            "maxSeconds": 5,
            "concurrency": 50,
            "statusCallback": statusCallback
        };
        let gLatency3;
        function statusCallback(error, result, latency) {
            gLatency3 = latency;
        }

        const operation = loadtest.loadTest(options, function(error) {
            if (error) {
                console.error('Got an error: %s', error);
            } else if (operation.running == false) {
                console.log("mean latency is " + gLatency3.meanLatencyMs);
                assert(gLatency3.meanLatencyMs <= 500, 'Mean latency greater than 500ms');
                done();
            }
        });
    });
});