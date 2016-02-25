'use strict';

//load dependencies
var gulp = require('gulp'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    del= require('del'),
    semver = require('semver'),
	less = require('gulp-less');

//get current app version
var version = require('./package.json').version;

//function for version lookup and tagging
function inc(importance) {
    //get new version number
    var newVer = semver.inc(version, importance);

    // get all the files to bump version in 
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files 
        .pipe(bump({ type: importance }))
        // save it back to filesystem 
        .pipe(gulp.dest('./'))
        // commit the changed version number 
        .pipe(git.commit('Release v' + newVer))
        // **tag it in the repository** 
        //.pipe(git.tag('v' + newVer));
        .pipe(git.tag('v' + newVer, 'Version message', function (err) {
            if (err) throw err;
        }));
}

//tasks for version tags
gulp.task('patch', ['dist'], function () { return inc('patch'); })
gulp.task('feature', ['dist'], function () { return inc('minor'); })
gulp.task('release', ['dist'], function () { return inc('major'); })

//push task for versioning
gulp.task('push', function () {
    console.info('Pushing...');
    return git.push('upstream', 'master', { args: " --tags" }, function (err) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.info('done pushing to github!');
        }
    });
});

//less compilation
gulp.task('less', function () {
    return gulp.src(['less/base.less'])
        .pipe(less())
        .pipe(gulp.dest('css'))
});

// Clean
gulp.task('clean', function (cb) {
    del([
      'css/**'
    ], cb);
});

// build dist
gulp.task('dist', ['less']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('dist');
});