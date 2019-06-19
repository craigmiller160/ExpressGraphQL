import * as gulp from 'gulp';
import * as typescript from 'gulp-typescript';

const tsProject = typescript.createProject('tsconfig.json');

gulp.task('compile', () => {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('out'));
});
