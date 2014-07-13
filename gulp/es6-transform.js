var through = require('through'),
    transpiler = require('es6-transpiler');

function transformer(filePattern) {
  filePattern = filePattern || /^(?!.*node_modules)+.+\.js$/;

  return function compile(file) {
    if(!filePattern.test(file)) return through();

    var buf = [];

    function buffer(data) {
      buf.push(data);
    }

    function transform() {
      var result = transpiler.run({
        src: buf.join(''),
        disallowUnknownReferences: false
      });

      if(result.errors && result.errors.length !== 0) {
        this.emit('error', result.errors);
      }

      this.queue(result.src);
      this.queue(null);
    }

    return through(buffer, transform);
  };
}

exports = module.exports = transformer();
exports.configure = transformer;