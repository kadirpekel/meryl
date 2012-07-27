var meryl = require('../../index'),
  connect = require('connect');

var twinkles = [
  'This is my first wink',
  'Lets twinkle for a second'
];

meryl

  .plug(
    connect.logger(),
    connect.static(__dirname + '/public'),
    connect.bodyParser()
  )

  .get('/', function (req, resp) {
    resp.render('index', {twinkles: twinkles});
  })

  .post('/newwink', function (req, resp) {
    twinkles.push(req.body.wink);
    resp.redirect('/');
  })

  .run({templateDir: 'views'});

console.log('listening...');

