let express = require('express');
let proxy = require('http-proxy-middleware');
let dns = require('dns');

let app = express();

let frontend = 'http://frontend-service:5000',
    archive = 'http://archive:8080',
    bff = 'http://bff:8080',
    crawl_repository = 'http://crawl-repository:8080';

dns.lookup('frontend-service', (err, address, family) => {
    console.info('frontend-service: %j family: IPv%s', address, family);
});

dns.lookup('bff', (err, address, family) => {
    console.info('bff: %j family: IPv%s', address, family);
});

dns.lookup('archive', (err, address, family) => {
    console.info('archive: %j family: IPv%s', address, family);
});

dns.lookup('crawl-repository', (err, address, family) => {
    console.info('crawl-repository: %j family: IPv%s', address, family);
});

let port = 80;

process.on('uncaughtException', function (err) {
    console.error("Uncaught exception: " + err.message);
});

app.all("/health", function (req, res) {
    console.info('Health check invoked');
    res.send('I\'m fine!');
});

app.use('/archive-api', proxy({
    target: archive,
    changeOrigin: true
}));

app.use('/crawl-repository', proxy({
    target: crawl_repository,
    changeOrigin: true,
    pathRewrite: {
        '^/crawl-repository': '', // remove '/crawl-repository' from the path
    },
}));

app.use('/api', proxy({
    target: bff,
    changeOrigin: true
}));

app.use('*', proxy({
    target: frontend,
    changeOrigin: true
}));

app.listen(port, () => {
    console.log("Proxy started! Listening on " + port);
});
