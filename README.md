Meryl
=====

Meryl is a minimalist web framework for nodejs platform.
It is really simple to use, fun to play and easy to modify.

It consists of only ~240 source lines of code. Here is the proof.

```
$ uglifyjs -b -nm --no-seqs -ns -nc meryl.js | wc -l
     233
```

Install
-------

Use node package manager 'npm' to install latest Meryl version.

```
npm install meryl
```

Usage
-----

Here is simple preview.

``` javascript
// take the pills
var meryl = require('meryl');

// first, take it easy
meryl.get('/', function (req, resp) {
	resp.end('<h3>Hello, World!</h3>');
});

// not impressed? let it interfere with blood some more
meryl.get('/greet/{who}', function(req, resp) {
	resp.render('greeter_template', {name: req.params.who});
});

// lay down and enjoy it
meryl.plug('GET *', function(req, resp, next) {
	resp.setHeader('server', 'meryl');
	next();
});
 
// now you are a 'meryl' junkie
meryl.run();
```

Meryl is Connect middleware compatible. Serve static content in seconds.

``` javascript
meryl
  .plug('GET *',
    connect.favicon(),
    connect.static(".")
  )
  .get('/', function (req, resp) {
    resp.end("<h1>Welcome To NodeJS!</h1><img src='nodejs.png' />");
  })
  .run();
```

Love (fab)? Checkout (fab) flavored meryl.

``` javascript
with (connect) {
  meryl
    .fabby
      (logger(), static("."))
      ('GET /', function (req, resp) {
          resp.render('home');
        }
      )
      ('GET /posts/{postid}', function (req, resp) {
          resp.render('home');
        }
      )
      ('GET /posts/{postid}/comments/{commentid}', function (req, resp) {
          resp.render('home');
        }
      )
      ();
}
```

Also taste meryl with coffeescript, using coffeekup

``` coffeescript

people = ['animal', 'beakers', 'piggy', 'kermit']

meryl

  .plug connect.logger(),
    connect.static(".")

  .get '/', (req, resp) ->
    resp.redirect('/people')

  .get '/people', (req, resp) ->
    resp.render 'layout',
      content: 'list'
      context:
        people: people

  .get '/people/{personid}', (req, resp) ->
    resp.render 'layout',
      content: 'show'
      context:
        person: people[req.params.personid]

  .run
    templateExt: '.coffee'
    templateFunc: coffeekup.adapters.meryl
```

You can of course use its cgi interface.

``` javascript
require('http').createServer(
  meryl
    .get('/', function (req, resp) {
      resp.end("<h1>Demonstraing Meryl</h1>");
    })
    .cgi()
).listen(3000);
```

Meryl has much more, please continue from the links below.

Please visit wiki page for documentation:
  <http://github.com/coffeemate/meryl/wiki>

Also there are plenty of examples in 'examples' directory:
  <http://github.com/coffeemate/meryl/tree/master/examples>

For updates please follow:
  <http://twitter.com/meryljs>

Contributors:

 * Kadir Pekel (Author) <http://twitter.com/kadirpekel>
 * George Stagas <http://twitter.com/stagas>
 * Samuel Morello <http://twitter.com/ouvanous>
 * Michael Siebert <http://twitter.com/siebertm>
 * Vladimir <http://github.com/semanticprogrammer>