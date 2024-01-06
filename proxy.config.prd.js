const proxy = [{
  context: '/api',
  target: 'https://api.admin.flisoldf.blog.br',
  secure: false,
  logLevel: "debug",
  pathRewrite: {
    '^/api': ''
  },
  changeOrigin: true
}];
module.exports = proxy;
