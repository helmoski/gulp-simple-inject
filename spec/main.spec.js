var File = require('gulp-util').File,
    path = require('path'),
    inject = require('../.'),
    cwd = process.cwd(),
    jsInjectTagRegex = /.*<!-- inject:js -->.*/,
    cssInjectTagRegex = /.*<!-- inject:css -->.*/;

describe("The gulp-simple-inject plugin", () => {
    var injector;
    
    beforeEach(() => {
        injector = inject();
    });
    
    it('should remove the js inject tag from the html document if no js files are supplied.', done => {
        injector.write(getHtmlFile('index'));
        injector.end();
        injector.on('data', file => {
            expect(file.contents.toString('utf8')).not.toMatch(jsInjectTagRegex);
            done();
        });
    });
    
    it('should remove the css inject tag from the html document if no css files are supplied.', done => { 
        injector.write(getHtmlFile('index'));
        injector.end();
        injector.on('data', file => {
            expect(file.contents.toString('utf8')).not.toMatch(cssInjectTagRegex);
            done();
        });
    });
    
    it('should replace the js inject tag in the html document with the supplied js file references.', done => {         
        injector.write(getHtmlFile('index'));
        injector.write(getJsFile('test1'));
        injector.write(getJsFile('test2'));
        injector.end();
        injector.on('data', file => {
            if(path.extname(file.path) === '.html') {
                expect(file.contents.toString('utf8')).toMatch(/.*<script src="test1.js"><\/script><script src="test2.js"><\/script>.*/);
                done();
            }
        });
    });
    
    it('should replace the css inject tag in the html document with the supplied css file references.', done => {         
        injector.write(getHtmlFile('index'));
        injector.write(getCssFile('test1'));
        injector.write(getCssFile('test2'));
        injector.end();
        injector.on('data', file => {
            if(path.extname(file.path) === '.html') {
                expect(file.contents.toString('utf8')).toMatch(/.*<link rel="stylesheet" type="text\/css" href="test1.css" \/><link rel="stylesheet" type="text\/css" href="test2.css" \/>.*/);
                done();
            }
        });
    });
    
    it('should not change the html document if there are no inject tags.', done => {
        injector.write(getHtmlFileWithoutInjectTags('index'));
        injector.write(getCssFile('test'));
        injector.write(getJsFile('test'));
        injector.end();
        injector.on('data', file => {
            if(path.extname(file.path) === '.html') {
                expect(file.contents.toString('utf8')).not.toMatch(/.*<link rel="stylesheet" type="text\/css" href="test.css" \/>.*<script src="test.js"><\/script>.*/);
                done();
            }
        });
    });
    
    it('should be capable of injecting into multiple html files.', done => {
        injector.write(getHtmlFile('index'));
        injector.write(getHtmlFile('test'));
        injector.write(getCssFile('test'));
        injector.write(getJsFile('test'));
        injector.end();
        
        var numHtmlFilesProcessed = 0;
        injector.on('data', file => {
            if(path.extname(file.path) === '.html') {
                numHtmlFilesProcessed++;
                expect(file.contents.toString('utf8')).toMatch(/.*<link rel="stylesheet" type="text\/css" href="test.css" \/>.*<script src="test.js"><\/script>.*/);
                if(numHtmlFilesProcessed == 2) {
                    done();
                }
            }
        });
    });

    it('should not break on an empty html file', done => {
        injector.write(getEmptyFile('empty-file'));
        injector.end();

        injector.on('data', () => {});

        injector.on('end', data => {
            done();
        });
    });
    
    describe('with the cwd option specified', () => {
        var injector;
        
        beforeEach(() => {
            injector = inject({cwd:'test'});
        });
        
        it('should inject the js and css file reference tags relative to the cwd option.', done => {
            injector.write(getHtmlFile('test/index'));
            injector.write(getCssFile('test/test'));
            injector.write(getJsFile('test/test'));
            injector.end();
            injector.on('data', file => {
                if(path.extname(file.path) === '.html') {
                    expect(file.contents.toString('utf8')).toMatch(/.*<link rel="stylesheet" type="text\/css" href="test.css" \/>.*<script src="test.js"><\/script>.*/);
                    done();
                }
            });
        });
    });
});

function getHtmlFile(name) {
    return new File({
        path: `${cwd}/${name}.html`,
        contents: new Buffer("<!DOCTYPE><html><head><title>Test</title><!-- inject:css --></head><body><h1>Test</h1><!-- inject:js --></body></html>", "utf8")
    });   
}

function getEmptyFile(name) {
    return new File({
        path: `${cwd}/${name}.html`,
        contents: new Buffer("", "utf8")
    });
}

function getHtmlFileWithoutInjectTags(name) {
    return new File({
        path: `${cwd}/${name}.html`,
        contents: new Buffer("<!DOCTYPE><html><head><title>Test</title></head><body><h1>Test</h1></body></html>", "utf8")
    });
}

function getJsFile(name) {
    return new File({
        path: `${cwd}/${name}.js`,
        contents: new Buffer("console.log('test');", "utf8")
    });
}

function getCssFile(name) {
    return new File({
        path: `${cwd}/${name}.css`,
        contents: new Buffer("body {color:blue;}", "utf8")
    });
}