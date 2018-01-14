"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();

gulp.task("style", function() {
  gulp.src("Assets/prepro.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 3 versions"
      ]})
    ]))
    .pipe(gulp.dest("Styles/"))
    .pipe(server.stream());
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: ".",
    index: "HTML/index.html",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("Assets/**/*.scss", ["style"]);
  gulp.watch("HTML/*.html").on("change", server.reload);
});
