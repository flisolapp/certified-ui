const proxy = [{
  context: '/api',
  target: 'http://localhost:8080', // Local environment
  pathRewrite: {
    '^/api': ''
  }
}];
module.exports = proxy;
