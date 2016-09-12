#!/usr/bin/env node

process.chdir('/code');

var Linter = require('ember-template-lint');
var walkSync = require('walk-sync');
var fs = require('fs');
var path = require('path');
var modulePrefix;

var linter = new Linter();
var dir = 'app';
var templateFiles;
try {
  fs.accessSync('addon', fs.F_OK);
  dir = 'addon';
  modulePrefix = require(process.cwd() + '/index').name;
} catch (e) {
  modulePrefix = require(process.cwd() + '/config/environment')('production').modulePrefix;
}

templateFiles = walkSync(dir).filter(function (file) {
  return path.extname(file) === '.hbs';
});

var issues = [];
var SEVERITY = ['info', 'normal', 'critical'];

templateFiles.forEach(function (file) {
  var filePath = path.join(dir, file);
  var contents = fs.readFileSync(filePath, { encoding: 'utf8' });
  var moduleId = path.join(modulePrefix, file).slice(0, -4);

  var errors = linter.verify({
    source: contents,
    moduleId: moduleId
  });

  errors.forEach(function (error) {
    issues.push({
      type: 'issue',
      check_name: error.rule,
      description: error.message,
      categories: ['Style'],
      severity: SEVERITY[error.severity - 1],
      locations: [{
        path: filePath,
        positions: {
          begin: {
            line: error.line,
            column: error.column
          },
          end: {
            line: error.line,
            column: error.column
          }
        }
      }]
    });
  });
});

issues.forEach(function (issue) {
  console.log(JSON.stringify(issue) + '\0');
});
