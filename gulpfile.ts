import * as gulp from 'gulp';
import * as typescript from 'gulp-typescript';
import tslint from 'gulp-tslint';
import nodemon from 'gulp-nodemon';
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
        .pipe(tslint.report({
            emitError: false
        }));
});

gulp.task('start', () => {
    return nodemon({
        script: 'out/app.js',
        tasks: [
            'tslint',
            'compile'
        ],
        ignore: [
            '.git/',
            'node_modules/'
        ],
        watch: ['src/'],
        ext: 'ts',
        env: {
            NODE_ENV: 'development',
            PORT: '8080',
            MONGO_USER: 'user',
            MONGO_PASSWORD: 'password',
            MONGO_AUTH_DB: 'admin',
            MONGO_DB: 'express_graphql',
            SALT_ROUNDS: '12'
        }
    })
});