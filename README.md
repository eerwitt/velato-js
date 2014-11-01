# Velato.js

A transpiler which takes (Velato)[http://danieltemkin.com/Velato] source "code" and compiles it to JavaScript.

As Daniel describes it:

> Velato is a programming language which uses MIDI files as source code: the pattern of notes determines commands. Velato offers an unusual challenge to programmer-musicians: to compose a musical piece that, in addition to expressing their aims musically, fills the constraints necessary to compile to a working Velato program. Each song has a secret message: the program it determines when compiled as Velato.

Although Velto.js doesn't parse MIDI files for ease of testing.

## Installation

Velato.js is available via `bower` and requires (escodegen)[https://github.com/Constellation/escodegen] to run.

Add to `bower.json`:

```javascript
{
  // ... rest of bower.json
  "dependencies":{
    "escodegen": "latest",
    "velatojs": "latest"
  }
  // ...
}
```

Then include in your HTML file:

```html
<html>
  <head>
    <script src="bower_components/escodegen/escodegen.browser.js"></script>
  </head>
  <body>
    <script src="bower_components/velatojs/velato.js"></script>
  </body>
</html>
```

## Usage

Using Velato.js to compile an executable JavaScript string is done using:

```
var javascript =  Velato.compileJS("C A G E E# A D# G");
eval(javascript);
```

By default Velato.js maps the command "C A G" (print command)[http://danieltemkin.com/Velato#commandList] to print output to the console with `console.log`.

Changing the print behaviour is done via implementing the function `Velato.output`. For example, to open an alert dialogue with the letter H:

```javascript
Velato.output = function (params) {
  alert(params);
}

var javascript = Velato.compileJS("C A G E E# A D# G");
eval(javascript);
```

## Developing

All the development is managed by a `Grunt` task in `Gruntfile.coffee`. The default task build `velato.js` and runs tests.

```bash
npm install
grunt
```

Tests are under `tests/velato`.
