const args = require('yargs').argv
const del = require('del')
const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const stream = browserSync.stream

let useSourceMaps = true
let isProduction = !!args.prod

if (isProduction) {
  useSourceMaps = false
}

// let handleErr = function(err) {
//   console.log(err.toString())
//   this.emit('end')
// }

const paths = {
  app: 'lib/',
  dist: 'dist/',
  scripts: 'js/',
  less: 'less/',
  css: 'css/',
  demo: 'demo/photoshop/'
}

const source = {
  scripts: {
    src: paths.app + '*',
    watch: paths.app + '*',
    demo: paths.demo + paths.scripts + '*'
  },
  styles: {
    demo: paths.demo + paths.less + '*'
  },
  html: {
    demo: [paths.demo + 'index.html']
  }
}

const build = {
  scripts: {
    dist: paths.dist,
    demo: paths.demo + paths.scripts
  },
  styles: {
    demo: paths.demo + paths.css
  }
}


let handleErr = (err) => {
  console.log(err.toString())
  this.emit('end')
}

gulp.task('watch', () => {
  gulp.watch(source.html.demo).on('change', reload)
  gulp.watch(source.scripts.watch, ['scripts:demo'])
  gulp.watch(source.styles.demo, ['styles:demo'])
  gulp.watch([source.scripts.demo, '!./demo/photoshop/js/photocover.js']).on('change', reload)
})

gulp.task('scripts:demo', () => {
  return gulp.src(source.scripts.src)
    .pipe($.if(useSourceMaps, $.sourcemaps.init()))
    .pipe($.typescript({
      noEmitOnError: true
    }))
    // .pipe($.babel({
    //   presets: ['es2015']
    // }).on('error', handleErr))
    .pipe($.if(useSourceMaps, $.sourcemaps.write()))
    .pipe(gulp.dest(build.scripts.demo))
    .pipe($.if(isProduction, reload({
      stream: true
    })))
})

gulp.task('scripts', () => {
  return gulp.src(source.scripts.src)
    .pipe($.if(useSourceMaps, $.sourcemaps.init()))
    .pipe($.typescript().on('error', handleErr))
    // .pipe($.babel({
    //   presets: ['es2015']
    // }).on('error', handleErr))
    .pipe($.uglify())
    .pipe($.if(useSourceMaps, $.sourcemaps.write()))
    .pipe($.if(isProduction, $.rename({suffix: '.min'})))
    .pipe(gulp.dest(build.scripts.dist))
    .pipe($.if(!isProduction, reload({
      stream: true
    })))
})


gulp.task('styles:demo', () => {
  return gulp.src(source.styles.demo)
    .pipe($.if(useSourceMaps, $.sourcemaps.init()))
    .pipe($.less().on('error', function (e) {console.error(e.message);this.emit('end')}))
    .pipe($.autoprefixer({
      browsers: ['last 2 version']
    }))
    .pipe($.if(isProduction, $.cssnano()))
    .pipe($.if(useSourceMaps, $.sourcemaps.write()))
    .pipe(gulp.dest(build.styles.demo))
    .pipe($.if(!isProduction, reload({
      stream: true
    })))
})

gulp.task('browser-sync', () => {
  browserSync.init({
    port: 5000,
    server: {
      baseDir: './demo/photoshop/'
    }
  })
})

gulp.task('demo', [
  'scripts:demo',
  'styles:demo',
  'watch',
  'browser-sync'
])


gulp.task('build', [
  'scripts'
])
