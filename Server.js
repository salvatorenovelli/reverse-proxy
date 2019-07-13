let app = require('express')();
let httpProxy = require('http-proxy');

let apiProxy = httpProxy.createProxyServer();
let frontend = 'http://frontend-service:5000',
    archive = 'http://archive:8080',
    backend = 'http://backend-service:8080';


const dns = require('dns');

dns.lookup('frontend-service', (err, address, family) => {
    console.info('frontend-service: %j family: IPv%s', address, family);
});

dns.lookup('backend-service', (err, address, family) => {
    console.info('backend-service: %j family: IPv%s', address, family);
});

dns.lookup('archive', (err, address, family) => {
    console.info('archive: %j family: IPv%s', address, family);
});

let port = 80;


process.on('uncaughtException', function (err) {
    console.error("Uncaught exception: " + err.message);
});

app.all("/health", function (req, res) {
    console.info('Health check invoked');
    res.send('I\'m fine!')
});


app.all("/api/*", function (req, res) {

    let dst = backend;

    let tokens = req.originalUrl.split("/");
    if (tokens[2] === "archive-api") {
        dst = archive;
    }

    console.info('redirecting ' + req.originalUrl + " to " + dst);
    apiProxy.web(req, res, {target: dst});
});

app.all("*", function (req, res) {
    console.info('redirecting ' + req.originalUrl + ' to frontend');
    apiProxy.web(req, res, {target: frontend});
});

app.listen(port);
console.log("Proxy started! Listening on " + port);
