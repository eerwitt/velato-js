(function() {
  var Lexer;

  Lexer = (function() {
    function Lexer(source) {
      this.source = source;
      this.clearReplay();
      this.setCurrentRoot(this.nextToken().note);
      this.clearReplay();
    }

    Lexer.prototype.setCurrentRoot = function(note) {
      return this._currentRoot = note;
    };

    Lexer.prototype.currentRoot = function() {
      return this._currentRoot;
    };

    Lexer.prototype.tokenSearch = function() {
      return /([a-g][#b]?)/img;
    };

    Lexer.prototype.clearReplay = function() {
      this._replayIndex = null;
      return this._replayTokens = [];
    };

    Lexer.prototype.rewind = function() {
      return this._replayIndex = 0;
    };

    Lexer.prototype.nextToken = function() {
      var match, token;
      if ((this._replayIndex != null) && this._replayIndex <= this._replayTokens.length - 1) {
        return this._replayTokens[this._replayIndex++];
      }
      this._search || (this._search = this.tokenSearch());
      match = this._search.exec(this.source);
      if (match != null) {
        token = new Velato.Token(this.currentRoot(), new Velato.Note(match[0]), match.index);
        this._replayTokens.push(token);
        return token;
      } else {
        return null;
      }
    };

    Lexer.prototype.nextStatement = function(statements, wholeTones) {
      var index, nextStatementNames, path, startToken, statement, statementName, statementNames, statementSemitone, token, _i, _len, _ref;
      if (wholeTones == null) {
        wholeTones = false;
      }
      index = 0;
      statementNames = (function() {
        var _results;
        _results = [];
        for (statementName in statements) {
          statement = statements[statementName];
          _results.push(statementName);
        }
        return _results;
      })();
      startToken = this.nextToken();
      token = startToken;
      while (statementNames.length > 0 && (token != null)) {
        nextStatementNames = [];
        for (_i = 0, _len = statementNames.length; _i < _len; _i++) {
          statementName = statementNames[_i];
          path = statements[statementName].path;
          statementSemitone = (_ref = path[index]) != null ? _ref.type : void 0;
          if (statementSemitone === token.interval() || (wholeTones && (statementSemitone === token.wholeInterval()))) {
            if (index === path.length - 1) {
              return {
                statementName: statementName,
                startToken: startToken,
                endToken: token
              };
            }
            nextStatementNames.push(statementName);
          }
        }
        statementNames = nextStatementNames;
        token = this.nextToken();
        index++;
      }
      return null;
    };

    Lexer.prototype.next = function() {
      return this.nextCommand();
    };

    Lexer.prototype.nextExpression = function() {
      return this.nextStatement(Velato.expressions(), true);
    };

    Lexer.prototype.nextCommand = function() {
      return this.nextStatement(Velato.commands());
    };

    return Lexer;

  })();

  window.Velato || (window.Velato = {});

  window.Velato.Lexer = Lexer;

}).call(this);

(function() {
  var Note;

  Note = (function() {
    function Note(noteName) {
      if (typeof noteName === "string") {
        this.noteName = this.constructor.capitalize(noteName);
      } else if (typeof noteName === "object" && noteName.length <= 2) {
        this.noteName = noteName.map(this.constructor.capitalize);
      } else {
        throw new Error("Unrecognized note name.");
      }
    }

    Note.capitalize = function(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    Note.prototype.variableNoteName = function() {
      return this.noteName.replace(/#/, "s");
    };

    Note.prototype.asInt = function(rootNote) {
      var distance, int, intervalTable;
      distance = this.semitoneDistance(rootNote);

      /*
       * In the Root of C
       * c#  d  d# e f f# g g# a a# b
       * 0   1  2  3 4 5  - 6  7 8  9
       */
      intervalTable = ["Minor Second", "Major Second", "Minor Third", "Major Third", "Perfect Fourth", "Augmented Fourth, Diminished Fifth", "Minor Sixth", "Major Sixth", "Minor Seventh", "Major Seventh"];
      int = intervalTable.indexOf(distance.interval);
      if (int === -1) {
        return null;
      }
      return int;
    };

    Note.prototype.semitoneDistance = function(rootNote) {
      return this.constructor.semitoneDistance(rootNote, this);
    };

    Note._intervals = function() {
      return "0-Perfect Prime\n1-Minor Second\n2-Major Second\n3-Minor Third\n4-Major Third\n5-Perfect Fourth\n6-Augmented Fourth, Diminished Fifth\n7-Perfect Fifth\n8-Minor Sixth\n9-Major Sixth\n10-Minor Seventh\n11-Major Seventh\n12-Perfect Octave".split(/\n/).map(function(n) {
        var interval, semitoneCount, _ref;
        _ref = n.split("-"), semitoneCount = _ref[0], interval = _ref[1];
        return {
          semitoneCount: parseInt(semitoneCount),
          interval: interval
        };
      });
    };

    Note.fromIntervalName = function(root, intervalName) {
      return this.noteFromSemitoneCount(root, this.interval(intervalName).semitoneCount);
    };

    Note.interval = function(intervalName) {
      var interval, intervals, _i, _len;
      intervals = this._intervals();
      for (_i = 0, _len = intervals.length; _i < _len; _i++) {
        interval = intervals[_i];
        if (interval.interval === intervalName) {
          return interval;
        }
      }
      return null;
    };

    Note.semitoneDistance = function(rootNote, note) {
      var distance, interval, intervals, _i, _len;
      intervals = this._intervals();
      distance = this.rawSemitoneDistance(rootNote, note);
      for (_i = 0, _len = intervals.length; _i < _len; _i++) {
        interval = intervals[_i];
        if (interval.semitoneCount === distance) {
          return interval;
        }
      }
      return null;
    };

    Note.noteFromSemitoneCount = function(rootNote, semitoneCount) {
      var firstIndex, i, offset, rootName, scale, scaleNote, selectedNote, _i, _j, _len, _len1;
      rootName = rootNote.noteName;
      scale = this.chromaticScale(rootName);
      firstIndex = null;
      selectedNote = null;
      for (i = _i = 0, _len = scale.length; _i < _len; i = ++_i) {
        scaleNote = scale[i];
        if (scaleNote.indexOf(rootName) !== -1) {
          firstIndex = i;
          break;
        }
      }
      for (i = _j = 0, _len1 = scale.length; _j < _len1; i = ++_j) {
        scaleNote = scale[i];
        offset = 0;
        if (firstIndex > i) {
          offset += scale.length;
        }
        if ((i + offset) - firstIndex === semitoneCount) {
          selectedNote = new Velato.Note(scaleNote);
        }
      }
      return selectedNote;
    };

    Note.rawSemitoneDistance = function(rootNote, note) {
      var exactNote, firstIndex, newIndex, noteName, rootName, scale, scaleNote, secondIndex, _i, _j, _len, _len1;
      rootName = rootNote.noteName;
      noteName = note.noteName;
      scale = this.chromaticScale(rootName);
      firstIndex = null;
      secondIndex = null;
      newIndex = 0;
      for (_i = 0, _len = scale.length; _i < _len; _i++) {
        scaleNote = scale[_i];
        newIndex += 1;
        for (_j = 0, _len1 = scaleNote.length; _j < _len1; _j++) {
          exactNote = scaleNote[_j];
          if (exactNote === rootName) {
            firstIndex = newIndex;
          }
          if (exactNote === noteName) {
            secondIndex = newIndex;
          }
        }
      }
      if (firstIndex > secondIndex) {
        secondIndex += scale.length + 1;
      }
      return secondIndex - firstIndex;
    };

    Note.chromaticScale = function(rootNote) {
      return this.scale(rootNote, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function() {
        return "h";
      }).join(" "));
    };

    Note.scale = function(rootNoteName, semitoneOffsets) {
      var availableNotes, currentNote, i, note, noteScale, semitoneDistance, semitones, _i, _j, _len, _len1;
      semitones = semitoneOffsets.split(/\s/).map(function(step) {
        if (step === "w") {
          return 2;
        } else {
          return 1;
        }
      });
      availableNotes = "C C#/Db D D#/Eb E E#/F F#/Gb G G#/Ab A A#/Bb B/Cb".split(/\s/).map(function(note) {
        return note.split(/\//);
      });
      currentNote = null;
      for (i = _i = 0, _len = availableNotes.length; _i < _len; i = ++_i) {
        note = availableNotes[i];
        if (note.indexOf(rootNoteName) !== -1) {
          currentNote = i;
          break;
        }
      }
      noteScale = [availableNotes[currentNote]];
      for (_j = 0, _len1 = semitones.length; _j < _len1; _j++) {
        semitoneDistance = semitones[_j];
        currentNote += semitoneDistance;
        if (currentNote >= availableNotes.length) {
          currentNote -= availableNotes.length;
        }
        noteScale.push(availableNotes[currentNote]);
      }
      return noteScale;
    };

    Note.major = function(rootNoteName) {
      return this.scale(base, "w w h w w w h");
    };

    Note.minor = function(rootNoteName) {
      return this.scale(base, "w h w w h w w");
    };

    return Note;

  })();

  window.Velato || (window.Velato = {});

  window.Velato.Note = Note;

}).call(this);

(function() {
  var AssignParselet, BinaryOperatorParselet, ChangeRootParselet, CharacterParselet, ConditionalParselet, DeclarationParselet, GroupParselet, InfixParselet, LogicalOperatorParselet, MathParselet, NegativeDoubleParselet, NegativeIntegerParselet, NotPrefixParselet, Parser, PositiveDoubleParselet, PositiveIntegerParselet, Precedence, PrefixParselet, PrintParselet, ProgramParselet, VariableParselet, VelatoParser, WhileParselet,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Precedence = {
    ASSIGNMENT: 1,
    CONDITIONAL: 2,
    SUM: 3,
    PRODUCT: 4,
    EXPONENT: 5,
    PREFIX: 6,
    POSTFIX: 7,
    CALL: 8
  };

  Parser = (function() {
    function Parser(tokens) {
      this.tokens = tokens;
      this.prefixParselets = {};
      this.infixParselets = {};
      this.read = [];
      this._command = false;
      this._expression = false;
      this._token = false;
    }

    Parser.prototype.register = function(type, parselet) {
      if (parselet instanceof PrefixParselet) {
        return this.prefixParselets[type] = parselet;
      } else {
        return this.infixParselets[type] = parselet;
      }
    };

    Parser.prototype.setParseToken = function() {
      this._command = false;
      this._expression = false;
      return this._token = true;
    };

    Parser.prototype.setParseCommand = function() {
      this._token = false;
      this._expression = false;
      return this._command = true;
    };

    Parser.prototype.setParseExpression = function() {
      this._command = false;
      this._token = false;
      return this._expression = true;
    };

    Parser.prototype.parseProgram = function() {
      Velato.parsingStarted();
      this.read.push({
        statementName: "PROGRAM"
      });
      return this.parseCommand();
    };

    Parser.prototype.parseExpression = function(precedence) {
      if (precedence == null) {
        precedence = 0;
      }
      this.setParseExpression();
      return this.parseStatement(precedence);
    };

    Parser.prototype.parseCommand = function(precedence) {
      if (precedence == null) {
        precedence = 0;
      }
      this.setParseCommand();
      return this.parseStatement(precedence);
    };

    Parser.prototype.parseStatement = function(precedence) {
      var infix, left, prefix, token;
      if (precedence == null) {
        precedence = 0;
      }
      token = this.consume();
      prefix = this.prefixParselets[token.statementName];
      if (prefix == null) {
        throw new Error("Could not parse \"" + token + "\".");
      }
      left = prefix.parse(this, token);
      while (precedence < this.getPrecedence()) {
        token = this.consume();
        infix = this.infixParselets[token.statementName];
        if (infix == null) {
          throw new Error("Could not parse \"" + token + "\".");
        }
        left = infix.parse(this, left, token);
      }
      return left;
    };

    Parser.prototype.setRootNote = function(rootNote) {
      return this.tokens.setCurrentRoot(rootNote);
    };

    Parser.prototype.match = function(expected) {
      var token;
      token = this.lookAhead();
      if (expected === null && (token == null)) {
        return true;
      } else if ((token != null ? token.statementName : void 0) !== expected) {
        return false;
      } else {
        return true;
      }
    };

    Parser.prototype.consume = function(expected) {
      var token;
      if (expected == null) {
        expected = null;
      }
      token = this.lookAhead();
      if ((expected != null) && (token != null ? token.statementName : void 0) !== expected) {
        throw new Error("Expected " + (JSON.stringify(expected)) + " but got " + (JSON.stringify(token)));
      }
      this.tokens.clearReplay();
      this.read.pop();
      return token;
    };

    Parser.prototype.rewind = function() {
      this.tokens.rewind();
      return this.read = [];
    };

    Parser.prototype.lookAhead = function(distance) {
      if (distance == null) {
        distance = 0;
      }
      while (distance >= this.read.length) {
        if (this._command) {
          this.read.push(this.tokens.nextCommand());
        } else if (this._expression) {
          this.read.push(this.tokens.nextExpression());
        } else if (this._token) {
          this.read.push(this.tokens.nextToken());
        } else {
          throw new Error("Unexpected type of statement.");
        }
      }
      return this.read[distance];
    };

    Parser.prototype.getPrecedence = function() {
      var parselet, _ref;
      this.setParseExpression();
      parselet = this.infixParselets[(_ref = this.lookAhead()) != null ? _ref.statementName : void 0];
      if (parselet != null) {
        return parselet.precedence;
      } else {
        return 0;
      }
    };

    return Parser;

  })();

  VelatoParser = (function(_super) {
    __extends(VelatoParser, _super);

    function VelatoParser(lexer) {
      VelatoParser.__super__.constructor.call(this, lexer);
      this.register("PROGRAM", new ProgramParselet());
      this.register("START", new ChangeRootParselet());
      this.register("PRINT", new PrintParselet());
      this.register("CHARACTER", new CharacterParselet());
      this.register("POSITIVE_INT", new PositiveIntegerParselet());
      this.register("NEGATIVE_INT", new NegativeIntegerParselet());
      this.register("POSITIVE_DOUBLE", new PositiveDoubleParselet());
      this.register("NEGATIVE_DOUBLE", new NegativeDoubleParselet());
      this.register("DECLARE", new DeclarationParselet());
      this.register("IF", new ConditionalParselet());
      this.register("WHILE", new WhileParselet());
      this.register("CHANGE_ROOT_NODE", new ChangeRootParselet());
      this.register("ASSIGN", new AssignParselet());
      this.register("VARIABLE", new VariableParselet());
      this.register("POW", new MathParselet("pow"));
      this.register("LOG", new MathParselet("log"));
      this.infixLeft("EQUAL", "==", Precedence.CALL);
      this.infixLeft("GT", ">", Precedence.CALL);
      this.infixLeft("LT", "<", Precedence.CALL);
      this.infixLeft("PLUS", "+", Precedence.SUM);
      this.infixLeft("MINUS", "-", Precedence.SUM);
      this.infixLeft("MULTIPLY", "*", Precedence.PRODUCT);
      this.infixLeft("DIVIDE", "/", Precedence.PRODUCT);
      this.infixLeft("MOD", "%", Precedence.SUM);
      this.infixLogicLeft("AND", "&&", Precedence.POSTFIX);
      this.infixLogicLeft("OR", "||", Precedence.POSTFIX);
      this.register("LEFT_PAREN", new GroupParselet());
      this.register("NOT", new NotPrefixParselet());
    }

    VelatoParser.prototype.infixLeft = function(type, op, precedence) {
      return this.register(type, new BinaryOperatorParselet(type, op, precedence));
    };

    VelatoParser.prototype.infixLogicLeft = function(type, op, precedence) {
      return this.register(type, new LogicalOperatorParselet(type, op, precedence));
    };

    return VelatoParser;

  })(Parser);

  InfixParselet = (function() {
    function InfixParselet() {
      this.precedence = 0;
    }

    InfixParselet.prototype.parse = function(parser, left, token) {};

    return InfixParselet;

  })();

  PrefixParselet = (function() {
    function PrefixParselet() {}

    PrefixParselet.prototype.parse = function(parser, token) {};

    return PrefixParselet;

  })();

  ChangeRootParselet = (function(_super) {
    __extends(ChangeRootParselet, _super);

    function ChangeRootParselet() {
      return ChangeRootParselet.__super__.constructor.apply(this, arguments);
    }

    ChangeRootParselet.prototype.compile = function() {
      return {
        type: "EmptyStatement",
        kind: "ChangeRootNote"
      };
    };

    ChangeRootParselet.prototype.parse = function(parser, token) {
      var newRoot;
      parser.setParseToken();
      newRoot = parser.consume();
      parser.setRootNote(newRoot.note);
      return this.compile();
    };

    return ChangeRootParselet;

  })(PrefixParselet);

  DeclarationParselet = (function(_super) {
    __extends(DeclarationParselet, _super);

    function DeclarationParselet() {
      this.precedence = Precedence.ASSIGNMENT;
    }

    DeclarationParselet.prototype.compile = function(declaration) {
      return {
        type: "VariableDeclaration",
        kind: "var",
        declarations: [declaration]
      };
    };

    DeclarationParselet.prototype.parse = function(parser, token) {
      var declaration, nameToken, type, typeToken;
      parser.setParseToken();
      nameToken = parser.consume();
      typeToken = parser.consume();
      type = (function() {
        switch (typeToken.wholeInterval()) {
          case "Second":
            return "Number";
          case "Third":
            return "String";
          case "Fourth":
            return "Number";
          default:
            return null;
        }
      })();
      declaration = {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: nameToken.note.variableNoteName()
        },
        init: {
          type: "NewExpression",
          callee: {
            type: "Identifier",
            name: type
          },
          "arguments": []
        }
      };
      return this.compile(declaration);
    };

    return DeclarationParselet;

  })(PrefixParselet);

  AssignParselet = (function(_super) {
    __extends(AssignParselet, _super);

    function AssignParselet() {
      return AssignParselet.__super__.constructor.apply(this, arguments);
    }

    AssignParselet.prototype.compile = function(declaration, right) {
      declaration = declaration;
      declaration.init = right;
      return {
        type: "VariableDeclaration",
        kind: "var",
        declarations: [declaration]
      };
    };

    AssignParselet.prototype.parse = function(parser, token) {
      var declaration, nameToken, right;
      parser.setParseToken();
      nameToken = parser.consume();
      right = parser.parseExpression(Precedence.ASSIGNMENT - 1);
      declaration = {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: nameToken.note.variableNoteName()
        }
      };
      return this.compile(declaration, right);
    };

    return AssignParselet;

  })(DeclarationParselet);

  VariableParselet = (function(_super) {
    __extends(VariableParselet, _super);

    function VariableParselet() {
      return VariableParselet.__super__.constructor.apply(this, arguments);
    }

    VariableParselet.prototype.compile = function(name) {
      return {
        type: "Identifier",
        name: name
      };
    };

    VariableParselet.prototype.parse = function(parser, token) {
      var name, nameToken;
      parser.setParseToken();
      nameToken = parser.consume();
      name = nameToken.note.variableNoteName();
      return this.compile(name);
    };

    return VariableParselet;

  })(PrefixParselet);

  CharacterParselet = (function(_super) {
    __extends(CharacterParselet, _super);

    function CharacterParselet() {
      return CharacterParselet.__super__.constructor.apply(this, arguments);
    }

    CharacterParselet.prototype.compile = function(name) {
      return {
        type: "Literal",
        value: name
      };
    };

    CharacterParselet.prototype.parse = function(parser, token) {
      var characterTokens, name;
      characterTokens = [];
      parser.setParseToken();
      while (true) {
        token = parser.consume();
        if (token == null) {
          throw new Error("Expected a Perfect Fifth but ran out of notes.");
        }
        if (token.interval() === "Perfect Fifth") {
          break;
        }
        characterTokens.push(token);
      }
      name = String.fromCharCode(characterTokens.map(function(token) {
        return token.int();
      }).join(""));
      return this.compile(name);
    };

    return CharacterParselet;

  })(PrefixParselet);

  PositiveIntegerParselet = (function(_super) {
    __extends(PositiveIntegerParselet, _super);

    function PositiveIntegerParselet() {
      return PositiveIntegerParselet.__super__.constructor.apply(this, arguments);
    }

    PositiveIntegerParselet.prototype.compile = function(number) {
      return {
        type: "Literal",
        value: number
      };
    };

    PositiveIntegerParselet.prototype.parse = function(parser, token) {
      var intTokens, number;
      intTokens = [];
      parser.setParseToken();
      while (true) {
        token = parser.consume();
        if (token == null) {
          throw new Error("Expected a Perfect Fifth but ran out of notes.");
        }
        if (token.interval() === "Perfect Fifth") {
          break;
        }
        intTokens.push(token);
      }
      number = parseInt(intTokens.map(function(token) {
        return token.int();
      }).join(""));
      return this.compile(number);
    };

    return PositiveIntegerParselet;

  })(PrefixParselet);

  NegativeIntegerParselet = (function(_super) {
    __extends(NegativeIntegerParselet, _super);

    function NegativeIntegerParselet() {
      return NegativeIntegerParselet.__super__.constructor.apply(this, arguments);
    }

    NegativeIntegerParselet.prototype.compile = function(number) {
      return {
        type: "UnaryExpression",
        operator: "-",
        prefix: true,
        argument: {
          type: "Literal",
          value: number
        }
      };
    };

    return NegativeIntegerParselet;

  })(PositiveIntegerParselet);

  PositiveDoubleParselet = (function(_super) {
    __extends(PositiveDoubleParselet, _super);

    function PositiveDoubleParselet() {
      return PositiveDoubleParselet.__super__.constructor.apply(this, arguments);
    }

    PositiveDoubleParselet.prototype.compile = function(number) {
      return {
        type: "Literal",
        value: number
      };
    };

    PositiveDoubleParselet.prototype.parse = function(parser, token) {
      var asInt, decimalExists, fraction, fractionTokens, integer, integerTokens, number;
      integerTokens = [];
      fractionTokens = [];
      parser.setParseToken();
      decimalExists = false;
      while (true) {
        token = parser.consume();
        if (token == null) {
          throw new Error("Expected a Perfect Fifth but ran out of notes.");
        }
        if (token.interval() === "Perfect Fifth") {
          if (!decimalExists) {
            decimalExists = true;
            continue;
          } else {
            break;
          }
        }
        if (!decimalExists) {
          integerTokens.push(token);
        } else {
          fractionTokens.push(token);
        }
      }
      asInt = function(token) {
        return token.int();
      };
      integer = integerTokens.map(asInt).join("");
      fraction = fractionTokens.map(asInt).join("");
      number = parseFloat([integer, fraction].join("."));
      return this.compile(number);
    };

    return PositiveDoubleParselet;

  })(PrefixParselet);

  NegativeDoubleParselet = (function(_super) {
    __extends(NegativeDoubleParselet, _super);

    function NegativeDoubleParselet() {
      return NegativeDoubleParselet.__super__.constructor.apply(this, arguments);
    }

    NegativeDoubleParselet.prototype.compile = function(number) {
      return {
        type: "UnaryExpression",
        operator: "-",
        prefix: true,
        argument: {
          type: "Literal",
          value: number
        }
      };
    };

    return NegativeDoubleParselet;

  })(PositiveDoubleParselet);

  NotPrefixParselet = (function(_super) {
    __extends(NotPrefixParselet, _super);

    function NotPrefixParselet() {
      this.precedence = Precedence.PREFIX;
    }

    NotPrefixParselet.prototype.compile = function(expression) {
      return {
        type: "UnaryExpression",
        operator: "!",
        prefix: true,
        argument: expression
      };
    };

    NotPrefixParselet.prototype.parse = function(parser, token) {
      var expression;
      expression = parser.parseExpression();
      return this.compile(expression);
    };

    return NotPrefixParselet;

  })(PrefixParselet);

  GroupParselet = (function(_super) {
    __extends(GroupParselet, _super);

    function GroupParselet() {
      this.precedence = Precedence.PREFIX;
    }

    GroupParselet.prototype.compile = function(expression) {
      return expression;
    };

    GroupParselet.prototype.parse = function(parser, token) {
      var expression;
      expression = parser.parseExpression();
      parser.consume("RIGHT_PAREN");
      return this.compile(expression);
    };

    return GroupParselet;

  })(PrefixParselet);

  ProgramParselet = (function(_super) {
    __extends(ProgramParselet, _super);

    function ProgramParselet() {
      return ProgramParselet.__super__.constructor.apply(this, arguments);
    }

    ProgramParselet.prototype.compile = function(ast) {
      return {
        type: "Program",
        body: ast
      };
    };

    ProgramParselet.prototype.parse = function(parser, token) {
      var ast;
      ast = [];
      while (!parser.match(null)) {
        ast.push(parser.parseCommand());
        if (parser.match(null)) {
          break;
        }
        parser.rewind();
        parser.setParseCommand();
        parser.consume("START");
      }
      return this.compile(ast);
    };

    return ProgramParselet;

  })(PrefixParselet);

  PrintParselet = (function(_super) {
    __extends(PrintParselet, _super);

    function PrintParselet() {
      return PrintParselet.__super__.constructor.apply(this, arguments);
    }

    PrintParselet.prototype.compile = function(args) {
      return {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            computed: false,
            object: {
              name: "Velato",
              type: "Identifier"
            },
            property: {
              name: "output",
              type: "Identifier"
            }
          },
          "arguments": args
        }
      };
    };

    PrintParselet.prototype.parse = function(parser, token) {
      var args;
      args = [parser.parseExpression()];
      return this.compile(args);
    };

    return PrintParselet;

  })(PrefixParselet);

  ConditionalParselet = (function(_super) {
    __extends(ConditionalParselet, _super);

    function ConditionalParselet() {
      this.precedence = Precedence.CONDITIONAL;
    }

    ConditionalParselet.prototype.compile = function(test, consequent, alternate) {
      var baseStatement;
      baseStatement = {
        type: "IfStatement",
        test: test,
        consequent: {
          type: "BlockStatement",
          body: consequent
        },
        alternate: null
      };
      if (alternate != null) {
        baseStatement.alternate = {
          type: "BlockStatement",
          body: alternate
        };
      }
      return baseStatement;
    };

    ConditionalParselet.prototype.parse = function(parser, token) {
      var alternate, consequent, parsingElse, test;
      test = parser.parseExpression();
      parser.rewind();
      parser.setParseCommand();
      parser.consume("START");
      consequent = [];
      alternate = null;
      parsingElse = false;
      while (true) {
        if (parser.match(null)) {
          throw new Error("Reached end of statement without end bracket.");
        }
        if (parser.match("ELSE")) {
          parser.consume();
          alternate = [];
          parsingElse = true;
        }
        if (parser.match("END_IF")) {
          parser.consume();
          break;
        }
        if (parsingElse) {
          alternate.push(parser.parseCommand(Precedence.CONDITIONAL - 1));
        } else {
          consequent.push(parser.parseCommand());
        }
        parser.rewind();
        parser.setParseCommand();
        parser.consume("START");
      }
      return this.compile(test, consequent, alternate);
    };

    return ConditionalParselet;

  })(PrefixParselet);

  WhileParselet = (function(_super) {
    __extends(WhileParselet, _super);

    function WhileParselet() {
      return WhileParselet.__super__.constructor.apply(this, arguments);
    }

    WhileParselet.prototype.compile = function(test, body) {
      return {
        type: "WhileStatement",
        test: test,
        body: {
          type: "BlockStatement",
          body: body
        },
        alternate: null
      };
    };

    WhileParselet.prototype.parse = function(parser, token) {
      var body, test;
      test = parser.parseExpression();
      parser.rewind();
      parser.setParseCommand();
      parser.consume("START");
      body = [];
      while (true) {
        if (parser.match(null)) {
          throw new Error("Reached end of statement without end bracket.");
        }
        if (parser.match("END_WHILE")) {
          parser.consume();
          break;
        }
        body.push(parser.parseCommand());
        parser.rewind();
        parser.setParseCommand();
        parser.consume("START");
      }
      return this.compile(test, body);
    };

    return WhileParselet;

  })(PrefixParselet);

  BinaryOperatorParselet = (function(_super) {
    __extends(BinaryOperatorParselet, _super);

    function BinaryOperatorParselet(type, op, precedence) {
      this.type = type;
      this.op = op;
      this.precedence = precedence;
    }

    BinaryOperatorParselet.prototype.compile = function(left, right) {
      return {
        type: "BinaryExpression",
        operator: this.op,
        left: left,
        right: right
      };
    };

    BinaryOperatorParselet.prototype.parse = function(parser, left, token) {
      var right;
      right = parser.parseExpression(this.precedence);
      return this.compile(left, right);
    };

    return BinaryOperatorParselet;

  })(InfixParselet);

  LogicalOperatorParselet = (function(_super) {
    __extends(LogicalOperatorParselet, _super);

    function LogicalOperatorParselet(type, op, precedence) {
      this.type = type;
      this.op = op;
      this.precedence = precedence;
    }

    LogicalOperatorParselet.prototype.compile = function(left, right) {
      return {
        type: "LogicalExpression",
        operator: this.op,
        left: left,
        right: right
      };
    };

    return LogicalOperatorParselet;

  })(BinaryOperatorParselet);

  MathParselet = (function(_super) {
    __extends(MathParselet, _super);

    MathParselet.prototype.compile = function(left, right) {
      return {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          computed: false,
          object: {
            name: "Math",
            type: "Identifier"
          },
          property: {
            name: this.op,
            type: "Identifier"
          }
        },
        "arguments": [left, right]
      };
    };

    function MathParselet(op) {
      this.op = op;
      this.precedence = Precedence.EXPONENT;
    }

    return MathParselet;

  })(BinaryOperatorParselet);

  window.Velato || (window.Velato = {});

  window.Velato.Parser = VelatoParser;

  window.Velato.compileAST = function(text) {
    var expr;
    return expr = new Velato.Parser(new Velato.Lexer(text)).parseProgram();
  };

  window.Velato.compileJS = function(text) {
    return window.escodegen.generate(Velato.compileAST(text));
  };

  window.Velato.output = function(args) {
    return console.log(args);
  };

  window.Velato.parsingStarted = function() {};

}).call(this);

(function() {
  var commands, expressions;

  expressions = function() {
    return {
      START: {
        path: [
          {
            type: "Perfect Prime"
          }
        ]
      },
      EQUAL: {
        path: [
          {
            type: "Second"
          }, {
            type: "Second"
          }
        ]
      },
      GT: {
        path: [
          {
            type: "Second"
          }, {
            type: "Third"
          }
        ]
      },
      LT: {
        path: [
          {
            type: "Second"
          }, {
            type: "Fourth"
          }
        ]
      },
      NOT: {
        path: [
          {
            type: "Second"
          }, {
            type: "Fifth"
          }
        ]
      },
      AND: {
        path: [
          {
            type: "Second"
          }, {
            type: "Sixth"
          }
        ]
      },
      OR: {
        path: [
          {
            type: "Second"
          }, {
            type: "Seventh"
          }
        ]
      },
      VARIABLE: {
        path: [
          {
            type: "Third"
          }, {
            type: "Second"
          }
        ]
      },
      POSITIVE_INT: {
        path: [
          {
            type: "Third"
          }, {
            type: "Fifth"
          }
        ]
      },
      NEGATIVE_INT: {
        path: [
          {
            type: "Third"
          }, {
            type: "Third"
          }
        ]
      },
      CHARACTER: {
        path: [
          {
            type: "Third"
          }, {
            type: "Fourth"
          }
        ]
      },
      POSITIVE_DOUBLE: {
        path: [
          {
            type: "Third"
          }, {
            type: "Sixth"
          }
        ]
      },
      NEGATIVE_DOUBLE: {
        path: [
          {
            type: "Third"
          }, {
            type: "Seventh"
          }
        ]
      },
      PLUS: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Fifth"
          }, {
            type: "Third"
          }
        ]
      },
      MINUS: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Fifth"
          }, {
            type: "Second"
          }
        ]
      },
      MULTIPLY: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Fifth"
          }, {
            type: "Fifth"
          }
        ]
      },
      DIVIDE: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Fifth"
          }, {
            type: "Fourth"
          }
        ]
      },
      MOD: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Fifth"
          }, {
            type: "Sixth"
          }
        ]
      },
      POW: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Seventh"
          }, {
            type: "Second"
          }
        ]
      },
      LOG: {
        path: [
          {
            type: "Fifth"
          }, {
            type: "Seventh"
          }, {
            type: "Third"
          }
        ]
      },
      LEFT_PAREN: {
        path: [
          {
            type: "Sixth"
          }, {
            type: "Sixth"
          }, {
            type: "Sixth"
          }
        ]
      },
      RIGHT_PAREN: {
        path: [
          {
            type: "Sixth"
          }, {
            type: "Sixth"
          }, {
            type: "Second"
          }
        ]
      }
    };
  };

  commands = function() {
    return {
      START: {
        path: [
          {
            type: "Perfect Prime"
          }
        ]
      },
      CHANGE_ROOT_NODE: {
        path: [
          {
            type: "Major Second"
          }
        ]
      },
      ASSIGN: {
        path: [
          {
            type: "Minor Third"
          }
        ]
      },
      DECLARE: {
        path: [
          {
            type: "Minor Sixth"
          }
        ]
      },
      WHILE: {
        path: [
          {
            type: "Major Third"
          }, {
            type: "Major Third"
          }
        ]
      },
      END_WHILE: {
        path: [
          {
            type: "Major Third"
          }, {
            type: "Perfect Fourth"
          }
        ]
      },
      IF: {
        path: [
          {
            type: "Major Third"
          }, {
            type: "Perfect Fifth"
          }
        ]
      },
      ELSE: {
        path: [
          {
            type: "Major Third"
          }, {
            type: "Major Sixth"
          }
        ]
      },
      END_IF: {
        path: [
          {
            type: "Major Third"
          }, {
            type: "Major Seventh"
          }
        ]
      },
      PRINT: {
        path: [
          {
            type: "Major Sixth"
          }, {
            type: "Perfect Fifth"
          }
        ]
      }
    };
  };

  window.Velato || (window.Velato = {});

  window.Velato.commands = commands;

  window.Velato.expressions = expressions;

}).call(this);

(function() {
  var Token;

  Token = (function() {
    function Token(root, note, position) {
      this.root = root;
      this.note = note;
      this.position = position;
    }

    Token.prototype.interval = function() {
      return this.note.semitoneDistance(this.root).interval;
    };

    Token.prototype.wholeInterval = function() {
      var _ref;
      return (_ref = this.note.semitoneDistance(this.root).interval.split(/\s/)) != null ? _ref.pop() : void 0;
    };

    Token.prototype.int = function() {
      return this.note.asInt(this.root);
    };

    return Token;

  })();

  window.Velato || (window.Velato = {});

  window.Velato.Token = Token;

}).call(this);
