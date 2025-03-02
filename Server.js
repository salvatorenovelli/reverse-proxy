const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dns = require('dns');

const app = express();

const frontend = process.env.FRONTEND_URL || 'http://frontend-service:5000';
const archive = process.env.ARCHIVE_URL || 'http://archive:8080';
const bff = process.env.BACKEND_URL || 'http://bff:8080';
const crawl_repository = process.env.CRAWL_REPOSITORY_URL || 'http://crawl-repository:8080';

const port = process.env.PORT || 80;

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

const onProxyError = (err, req, res) => {
    console.error(`Proxy error for ${req.url}:`, err.message);
    res.status(502).send('Bad Gateway');
};

// Health Check
app.all("/health", (req, res) => {
    console.info('Health check invoked');
    res.send("I'm fine!");
});

// API Proxy Routes
app.use('/archive-api', createProxyMiddleware({
    target: archive,
    changeOrigin: true,
    onError: onProxyError
}));

app.use('/crawl-repository', createProxyMiddleware({
    target: crawl_repository,
    changeOrigin: true,
    pathRewrite: { '^/crawl-repository': '' },
    onError: onProxyError
}));

app.use('/api', createProxyMiddleware({
    target: bff,
    changeOrigin: true,
    onError: onProxyError
}));

// Frontend Catch-All Route
app.use('/', createProxyMiddleware({
    target: frontend,
    changeOrigin: true,
    onError: onProxyError
}));

// Graceful Error Handling
process.on('uncaughtException', (err) => {
    console.error("Uncaught exception:", err.message);
});

// Start Server
app.listen(port, () => {
    console.log(`Proxy started! Listening on port ${port}`);
});
