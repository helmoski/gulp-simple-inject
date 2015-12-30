# gulp-simple-inject

> Gulp plugin for injecting JS and CSS file references into html files.

[![Build Status][travis-image]][travis-url]

This plugin takes in a stream of js, css, and html files; and injects the js and css file references into placeholders in the html files.

### Installation

```{shell}
npm install gulp-simple-inject
```

### Usage

Imagine you have a project with the following structure:

```
|
|--- app
| |
| |--- test
| | |
| | |--- test.js
| | |
| | |--- test.css
| |
| |--- app.js
| |
| |--- app.css
| |
| |---index.html
|
|--- dist
|
|--- node_modules
| |
| |--- etc...
|
|--- gulpfile.js
|
|--- package.json
```

Here is the content of `app/index.html`:

```{html}
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
    <!-- inject:css -->
</head>
<body>
    <h1>Test</h1>
    <!-- inject:js -->
</body>
</html>
```

`<!-- inject:css -->` and `<!-- inject:js -->` are the placeholders that will be replaced by the css and js file references.

Here is the content of `gulpfile.js`:

```{js}
var gulp = require('gulp'),
    inject = require('gulp-simple-inject');
    
gulp.task('default', () => {
    return gulp.src('app/**/*')
        .pipe(inject({cwd:'app'}))
        .dest('dist');
});
```

The `gulp-simple-inject` plugin accepts an `options` argument. Currently there is only one option available: `cwd`. This option specifies the directory that the injected file paths should be relative to. In this example, the injected file paths will be relative to the `app` directory.

Run the task we created like so:

```{shell}
gulp
```

The content of the `app` directory will now have been copied over to the `dist` directory. The content of `dist/index.html` will be as follows:

```{html}
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
    <link rel="stylesheet" type="text/css" href="app.css" /><link rel="stylesheet" type="text/css" href="test/test.css" />
</head>
<body>
    <h1>Test</h1>
    <style src="app.js"></style><style src="test/test.js"></style>
</body>
</html>
```
