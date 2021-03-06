module.exports = function (project) {
  var path = require('path')
  var repoRoot = path.join(__dirname, '..')
  return function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage-istanbul-reporter'),
        require('karma-spec-reporter'),
        require('@angular-devkit/build-angular/plugins/karma'),
        require(path.join(repoRoot, 'build/karma.test.reporter.js'))
      ],
      client: {
        clearContext: false, // leave Jasmine Spec Runner output visible in browser
        captureConsole: true,
        jasmine: {
          random: false
        }
      },
      coverageIstanbulReporter: {
        dir: path.join(repoRoot, 'coverage', project),
        reports: ['html', 'lcovonly', 'json'],
        fixWebpackSourcePaths: true
      },
      reporters: ['spec', 'kjhtml', 'stratos'],
      specReporter: {
        suppressSkipped: true, // skip result of skipped tests
      },
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: process.env.HEADLESS ? ['StratosChromeHeadless'] : ['Chrome'],
      customLaunchers: {
        StratosChromeHeadless: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },
      singleRun: process.env.CI_ENV ? true : false,
      files: [{
        pattern: path.join(repoRoot, 'node_modules/@angular/material/prebuilt-themes/indigo-pink.css')
      }],
      exclude: [
        '**/*-e2e.spec.ts'
      ]
    });
  };
}
