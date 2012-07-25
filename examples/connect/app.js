var connect = require('connect'),
  meryl = require('../../index');

meryl
  .p(
    function (req, resp, next) {
      resp.setHeader('backend', 'nodejs/connect/meryl');
      next();
    },
    connect.logger()
  )  
  .p('GET *',
    connect.favicon(),
    connect.static(__dirname)
  )
  .h('GET /', function (req, resp) {
    resp.end("<h1>Welcome To NodeJS!</h1><img src='nodejs.png' />");
  })
  .run();

console.log('listening...');
