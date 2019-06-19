import * as gulp from 'gulp';
import * as typescript from 'gulp-typescript';
import tslint from 'gulp-tslint';
import { Project } from 'gulp-typescript';

const tsProject: Project = typescript.createProject('tsconfig.json');

gulp.task('compile', () => {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('out'));
});

gulp.task('tslint', () => {
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});