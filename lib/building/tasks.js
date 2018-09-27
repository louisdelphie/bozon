var fs = require('fs')
var jsonEditor = require('gulp-json-editor')
var bozon = require('../bozon')

bozon.hooks.push(
  'html',
  'images',
  'styles',
  'scripts:main',
  'scripts:renderer'
)

bozon.task('html', function () {
  return bozon.src('src/*.html').pipe(bozon.dest('src'))
})

bozon.task('styles', function () {
  return bozon.src('assets/stylesheets/**/*.css').pipe(bozon.dest('assets/stylesheets'))
})

bozon.task('scripts:main', function () {
  return bozon.src('src/javascripts/main/**/*.*').pipe(bozon.dest('src/javascripts/main'))
})

bozon.task('scripts:renderer', function () {
  var webpack = bozon.requireLocal('webpack-stream')
  return bozon.src('src/javascripts/renderer/application.*').pipe(
    webpack(bozon.webpackConfig())
  ).pipe(bozon.dest('src/javascripts/renderer'))
})

bozon.task('images', function () {
  return bozon.src('assets/images/**/*').pipe(bozon.dest('assets/images'))
})

bozon.task('prepare:app', bozon.hooks, function () {
  var settings = new bozon.Settings()
  fs.stat(bozon.sourcePath('node_modules'), function (err, stat) {
    if (!err) {
      var platform = process.platform
      var command = platform !== 'darwin' && platform.indexOf('win') > -1 ? 'copy' : 'cp'
      bozon.spawnSync(command, [
        '-r',
        bozon.sourcePath('node_modules'),
        bozon.destinationPath()
      ])
    }
  })
  return bozon.src('package.json').pipe(jsonEditor({
    settings: settings.get()
  })).pipe(bozon.dest())
})

bozon.task('watch', function() {
  bozon.watch(bozon.sourcePath('src/**/*.html'), ['html'])
  bozon.watch(bozon.sourcePath('assets/images/**/*'), ['images'])
  bozon.watch(bozon.sourcePath('assets/stylesheets/**/*'), ['styles'])
  bozon.watch(bozon.sourcePath('src/javascripts/renderer/**/*.*'), ['scripts:renderer'])
  bozon.watch(bozon.sourcePath('src/javascripts/main/**/*.*'), ['scripts:main'])
})
