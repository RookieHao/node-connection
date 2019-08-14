import gulp from "gulp";
import ts from "gulp-typescript";
import babel from "gulp-babel";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import del from "del";
const tsconfig = require("./tsconfig.json");
const paths = {
  styles: {
    src: "lib/**/*.css",
    dest: "dist/styles/"
  },
  scripts: {
    src: "lib/**/*.ts",
    dest: "dist/"
  }
};

function compileTS() {
  return gulp
    .src(paths.scripts.src)
    .pipe(ts(tsconfig))
    .pipe(babel())
    .pipe(uglify())
    // .pipe(concat("main.min.js"))
    .pipe(gulp.dest(paths.scripts.dest))
}

gulp.task('watch',()=>{
  gulp.watch(paths.scripts.src, build);
})

gulp.task('huild',build)

export const clean = () => del([paths.scripts.dest]);

export const build = gulp.series(clean, gulp.parallel(compileTS));

export default build;
