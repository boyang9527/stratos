'use strict';

exports.config = {

  specs: ['../e2e/**/*.spec.js'],

  framework: 'jasmine2',

  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  }
};
