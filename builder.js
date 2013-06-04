var fs = require('fs')
  , Builder = require('component-builder')
  , c7tStylus = require('component-stylus');

var builder = new Builder(__dirname);

builder.use(c7tStylus);

builder.build(function(err, res){
    if (err) throw err;

    fs.writeFileSync('build/build.js', res.require + res.js);
    fs.writeFileSync('build/build.css', res.css);
});
