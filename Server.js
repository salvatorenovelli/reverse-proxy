let express = require('express');
let { createProxyMiddleware } = require('http-proxy-middleware');
let dns = require('dns');

let app = express();

let frontend = 'http://frontend-service:5000',
    archive = 'http://archive:8080',
    backend = 'http://backend-service:8080',
    crawl_repository = 'http://crawl-repository:8080';

dns.lookup('frontend-service', (err, address, family) => {
    console.info('frontend-service: %j family: IPv%s', address, family);
});

dns.lookup('backend-service', (err, address, family) => {
    console.info('backend-service: %j family: IPv%s', address, family);
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

app.use('/archive-api', createProxyMiddleware({
    target: archive,
    changeOrigin: true
}));

app.use('/crawl-repository', createProxyMiddleware({
    target: crawl_repository,
    changeOrigin: true,
    pathRewrite: {
        '^/crawl-repository': '', // remove '/crawl-repository' from the path
    },
}));

app.use('/api', createProxyMiddleware({
    target: backend,
    changeOrigin: true
}));

app.use('*', createProxyMiddleware({
    target: frontend,
    changeOrigin: true
}));

app.listen(port, () => {
    console.log("Proxy started! Listening on " + port);
});
