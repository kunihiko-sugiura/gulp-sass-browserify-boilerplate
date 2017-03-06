const gulp            = require("gulp");
const sass            = require("gulp-sass");
const autoprefixer    = require("gulp-autoprefixer");
const uglify          = require("gulp-uglify");
const plumber         = require("gulp-plumber");
const notify          = require("gulp-notify");
const minimist        = require('minimist');
const gulpif          = require('gulp-if');
const minifyCss       = require('gulp-minify-css');
const browserify      = require('browserify');
const source          = require('vinyl-source-stream');
const buffer          = require('vinyl-buffer');
const imagemin        = require('gulp-imagemin');
const pngquant        = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');

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
    gulp.src(["src/sass/**/*.scss", "!src/sass/include/*"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(sass({}))
        .pipe(gulpif( isProduction , autoprefixer() ))
        .pipe(gulpif( isProduction , minifyCss() ))
        .pipe(gulp.dest("./css"));
});

gulp.task("js", function () {
    gulp.src(["src/js/*.js"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(uglify())
        .pipe(gulp.dest("./js"));
});

gulp.task("img", function () {
    gulp.src(["src/img/**/*.{png,gif,jpg,svg}"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                { removeViewBox: false },
                { cleanupIDs: false }
            ],
            use: [
                imageminJpegtran({
                    progressive: true
                }),
                pngquant({
                    quality: '60-80',
                    speed: 1
                })
            ]
        }))
        .pipe(gulp.dest("./img"));
});

gulp.task('js-common-bundle', function() {
    return browserify({
        debug : !isProduction
    })
    .transform("babelify")
    // ** ここで必要な外部ライブラリや自作ライブラリをrequireする
    // .require('vue')
    // .require('./js/vue-plugin/vue-input-helper.js', {expose: 'VueInputHelper'})
    .bundle()
    .pipe(source('common-bundle.js'))
    .pipe(buffer())
    .pipe(gulpif( isProduction , uglify() ))
    .pipe(gulp.dest('./js'));

    // Notice:jsのbuildだけなら、ただ単にpackage.jsonの設定でも良し。
    // "scripts": {
    //     "build:js": "browserify -r ./src/common.js:common -o ./dest/common.js"
    // },
});

gulp.task("default", function () {
    gulp.watch(["src/js/*.js"], ["js"]);
    gulp.watch("src/js/common-bundle/*.js", ["js-common-bundle"]);
    gulp.watch(["src/sass/**/*.scss", "!src/sass/include/*"], ["sass"]);
    gulp.watch(["src/img/**/*.{png,gif,jpg,svg}"], ["img"]);
});
