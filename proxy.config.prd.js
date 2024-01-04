const proxy = [{
  context: '/api',
  target: 'https://api.admin.flisoldf.blog.br',
  pathRewrite: {
    '^/api': ''
  }
}];
module.exports = proxy;
