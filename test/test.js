#!/usr/bin/env node

var vm      = require('vm'),
    fs      = require('fs'),
    path    = require('path'),
    assert  = require('assert'),
    traceur = require('../traceur.js');

function compile(source) {
  var hasError = false;

  var reporter = new traceur.util.ErrorReporter();
  reporter.reportMessageInternal = function(location, kind, format, args) {
    var i = 0;
    var message = format.replace(/%s/g, function() {
      return args[i++];
  });
  if (location)
    format = location + ': ' + message;
  throw new Error(format);
};

var project = new traceur.semantics.symbols.Project();
var name = 'javascript code';
// need improvement!
var nextCode = fs.readFileSync(source, 'utf8');
var sourceFile = new traceur.syntax.SourceFile(name, nextCode);
project.addFile(sourceFile);
var res = traceur.codegeneration.Compiler.compile(reporter, project, false);
if (reporter.hadError()) {
  hasError = true;
} else {
  var jsCode = traceur.codegeneration.ProjectWriter.write(res);

  //console.log(jsCode);
  if (1) {
    try {
      //vm.runInThisContext(jsCode);
      console.log(jsCode);
    } catch(ex) {
      throw ex;
    }

    assert.ok(!hasError, 'Error');
  }
}
};

compile('./source.js');
