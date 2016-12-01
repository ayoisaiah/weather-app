"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const babel = require("gulp-babel");
const useref = require("gulp-useref");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");
const cssnano = require("gulp-cssnano");
const concat = require("gulp-concat");
const rename = require("gulp-rename");

const jsfiles = "src/vendor/mdl/scripts/**/*.js";

gulp.task("mdl", function () {
	return gulp.src(jsfiles)
	.pipe(concat("mdl.js"))
  .pipe(uglify())
	.pipe(gulp.dest("src/scripts"));
});

gulp.task("sass", function () {
	return gulp.src("src/stylesheet/sass/main.scss")
	.pipe(sass())
	.pipe(gulp.dest("src/stylesheet/css"))
	.pipe(browserSync.reload({
		stream: true
	}));
});

gulp.task("browserSync", function () {
	browserSync.init({
		server: {
			baseDir: "src/"
		}
	});
});

gulp.task("babel", function () {
  return gulp.src("src/scripts/main.js")
	.pipe(babel())
  .pipe(uglify())
	.pipe(gulp.dest("src/scripts/babel"));
});

gulp.task("useref", function (){
	return gulp.src("src/index.html")
	.pipe(useref())
  .pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest("build"));
});

gulp.task("watch", ["browserSync", "sass", "babel", "useref"], function() {
	gulp.watch("src/scripts/main.js", ["babel", "useref"]);
	gulp.watch("src/stylesheet/sass/**/*.scss", ["sass", "useref"]);
  gulp.watch("src/index.html", ["useref"]);
	gulp.watch("build/index.html", browserSync.reload);
	gulp.watch("build/js/app.min.js", browserSync.reload);
});

gulp.task("default", ["mdl", "watch"], function() {
});
