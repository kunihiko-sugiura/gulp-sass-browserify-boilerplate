var gulp            = require("gulp");
var sass            = require("gulp-sass");
var autoprefixer    = require("gulp-autoprefixer");
var uglify          = require("gulp-uglify");
var plumber         = require("gulp-plumber");
var notify          = require("gulp-notify");
var cleanCSS        = require('gulp-clean-css');
var minimist        = require('minimist');
var gulpif          = require('gulp-if');
var browserify      = require('browserify');
var source          = require('vinyl-source-stream');
var buffer          = require('vinyl-buffer');
var imagemin        = require('gulp-imagemin');
var pngquant        = require('imagemin-pngquant');

// ** parse args
var knownOptions = {
 string: 'env',
 default: { env: process.env.NODE_ENV || 'development' }
};
var options = minimist(process.argv.slice(2), knownOptions);
process.env.NODE_ENV = options.env || 'development';
var isProduction = (options.env == 'production');

// ** log
console.log('[NODE_ENV]', process.env.NODE_ENV);

gulp.task("sass", function () {
    gulp.src("src/sass/**/*.scss")
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(sass({}))
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(gulp.dest("./css"));
});

gulp.task("js", function () {
    gulp.src(["src/js/*.js"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(uglify())
        .pipe(gulp.dest("./js"));
});

gulp.task("png", function () {
    gulp.src(["src/img/**/*.png"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(imagemin({
            use: [pngquant({
                quality: '60-80',
                speed: 1
            })]
        }))
        .pipe(gulp.dest("./img"));
});
gulp.task("img", function () {
    gulp.src(["src/img/**/*.jpg"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(imagemin())
        .pipe(gulp.dest("./img"));
});

gulp.task('js-common-bundle', function() {
    return browserify({
        debug : !isProduction
    })
    // .require('jquery')
    // .require('./js/vue-plugin/vue-input-helper.js', {expose: 'VueInputHelper'})
    .bundle().pipe(source('common-bundle.js'))
    .pipe(buffer())
    .pipe(gulpif( isProduction , uglify() ))
    .pipe(gulp.dest('./js/bundle/'));

    // Notice:ただ単にpackage.jsonでも良し。
    // "scripts": {
    //     "build:js": "browserify -r ./src/common.js:common -o ./dest/common.js"
    // },
});

gulp.task("default", function () {
    gulp.watch(["src/js/*.js"], ["js"]);
    gulp.watch("src/js/bundle/*.js", ["js"]);
    gulp.watch("src/sass/**/*.scss", ["sass"]);
    gulp.watch("src/img/**/*.png", ["png"]);
    gulp.watch(["src/img/**/*.*", "!src/img/**/*.png"], ["img"]);
});
