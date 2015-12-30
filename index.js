const PLUGIN_NAME = 'gulp-simple-inject';

// Dependencies
var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    replace = require('stream-replace'),
    util = require('util'),
    path = require('path');

// Global variables
var globals = {
    cwd: process.cwd(),
    htmlFiles: [],
    cssRefs: "",
    jsRefs: ""
};

function inject(options) {
    if(util.isObject(options) && util.isString(options.cwd)) {
        globals.cwd = path.resolve(globals.cwd, options.cwd);
    }
    
    return through.obj(transform, end);
}

function transform(file, enc, cb) {
    var ext = path.extname(file.path),
        relativePath = path.relative(globals.cwd, file.path);
    
    if(file.isNull) {
        this.push(file);
    } else if(ext === '.html') {
        globals.htmlFiles.push(file);
    } else if(ext === '.js') {
        globals.jsRefs = `${globals.jsRefs}<script src="${relativePath}"></script>`;
        this.push(file);
    } else if(ext === '.css') {
        globals.cssRefs = `${globals.cssRefs}<link type="stylesheet" type="text/css" href="${relativePath}" />`;
        this.push(file);
    } else {
        this.push(file);
    }
    
    cb();
}

function end(cb) {
    var promises = [];
    
    for(var htmlFile of globals.htmlFiles) {
        promises.push(injectTags(htmlFile));
    }
    
    Promise.all(promises).then(htmlFiles => {
        for(var htmlFile of htmlFiles) {
            this.push(htmlFile);
        }
        cb();
    }).catch(e => {
        throw new PluginError(PLUGIN_NAME, `Failed to inject tags:\r\n${e}`);
    });
}

function injectTags(htmlFile) {
    return new Promise((resolve, reject) => {
         htmlFile
            .pipe(replace("<!-- inject:js -->", globals.jsRefs))
            .pipe(replace("<!-- inject:css -->", globals.cssRefs))
            .on('data', chunk => {
                htmlFile.contents = chunk;
                resolve(htmlFile);
            }).on('error', e => {
                reject(e);
            });
    });
}

module.exports = inject;