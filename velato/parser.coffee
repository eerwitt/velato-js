Precedence =
  # Ordered in increasing precedence
  ASSIGNMENT:     1
  CONDITIONAL:    2
  SUM:            3
  PRODUCT:        4
  EXPONENT:       5
  PREFIX:         6
  POSTFIX:        7
  CALL:           8

class Parser
  constructor: (@tokens) ->
    @prefixParselets = {}
    @infixParselets = {}
    @read = []

    @_command = false
    @_expression = false
    @_token = false

  register: (type, parselet) ->
    if parselet instanceof PrefixParselet
      @prefixParselets[type] = parselet
    else
      @infixParselets[type] = parselet

  setParseToken: ->
    @_command = false
    @_expression = false
    @_token = true

  setParseCommand: ->
    @_token = false
    @_expression = false
    @_command = true

  setParseExpression: ->
    @_command = false
    @_token = false
    @_expression = true

  parseProgram: ->
    Velato.parsingStarted()

    @read.push(statementName: "PROGRAM")
    @parseCommand()

  parseExpression: (precedence = 0) ->
    @setParseExpression()
    @parseStatement(precedence)

  parseCommand: (precedence = 0) ->
    @setParseCommand()
    @parseStatement(precedence)

  parseStatement: (precedence = 0) ->
    token = @consume()
    prefix = @prefixParselets[token.statementName]
    throw new Error "Could not parse \"#{token}\"." if not prefix?
    
    left = prefix.parse this, token
    while precedence < @getPrecedence()
      token = @consume()
      
      infix = @infixParselets[token.statementName]
      throw new Error "Could not parse \"#{token}\"." if not infix?
      left = infix.parse this, left, token

    left

  setRootNote: (rootNote) ->
    @tokens.setCurrentRoot(rootNote)

  match: (expected) ->
    token = @lookAhead()

    if expected is null and not token?
      true
    else if token?.statementName isnt expected
      false
    else
      true

  consume: (expected = null) ->
    token = @lookAhead()

    if expected? and token?.statementName isnt expected
      throw new Error "Expected #{JSON.stringify(expected)} but got #{JSON.stringify(token)}"

    @tokens.clearReplay()
    @read.pop()
    token

  rewind: ->
    @tokens.rewind()
    @read = []

  lookAhead: (distance = 0) ->
    while distance >= @read.length
      if @_command
        @read.push @tokens.nextCommand()
      else if @_expression
        @read.push @tokens.nextExpression()
      else if @_token
        @read.push @tokens.nextToken()
      else
        throw new Error "Unexpected type of statement."

    @read[distance]

  getPrecedence: ->
    @setParseExpression()
    parselet = @infixParselets[@lookAhead()?.statementName]

    if parselet? then parselet.precedence else 0

class VelatoParser extends Parser
  constructor: (lexer) ->
    super lexer

    @register "PROGRAM", new ProgramParselet()
    @register "START", new ChangeRootParselet()
    @register "PRINT", new PrintParselet()
    @register "CHARACTER", new CharacterParselet()
    @register "POSITIVE_INT", new PositiveIntegerParselet()
    @register "NEGATIVE_INT", new NegativeIntegerParselet()

    @register "POSITIVE_DOUBLE", new PositiveDoubleParselet()
    @register "NEGATIVE_DOUBLE", new NegativeDoubleParselet()

    @register "DECLARE", new DeclarationParselet()
    @register "IF", new ConditionalParselet()
    @register "WHILE", new WhileParselet()
    @register "CHANGE_ROOT_NODE", new ChangeRootParselet()
    @register "ASSIGN", new AssignParselet()

    @register "VARIABLE", new VariableParselet()
    @register "POW", new MathParselet("pow")
    @register "LOG", new MathParselet("log")

    @infixLeft "EQUAL", "==", Precedence.CALL
    @infixLeft "GT", ">", Precedence.CALL
    @infixLeft "LT", "<", Precedence.CALL

    @infixLeft "PLUS", "+", Precedence.SUM
    @infixLeft "MINUS", "-", Precedence.SUM
    @infixLeft "MULTIPLY", "*", Precedence.PRODUCT
    @infixLeft "DIVIDE", "/", Precedence.PRODUCT
    @infixLeft "MOD", "%", Precedence.SUM


    @infixLogicLeft "AND", "&&", Precedence.POSTFIX
    @infixLogicLeft "OR", "||", Precedence.POSTFIX

    @register "LEFT_PAREN", new GroupParselet()
    @register "NOT", new NotPrefixParselet()

  infixLeft: (type, op, precedence) ->
    @register type, new BinaryOperatorParselet(type, op, precedence)

  infixLogicLeft: (type, op, precedence) ->
    @register type, new LogicalOperatorParselet(type, op, precedence)

class InfixParselet
  constructor: ->
    @precedence = 0

  parse: (parser, left, token) ->

class PrefixParselet
  parse: (parser, token) ->

class ChangeRootParselet extends PrefixParselet
  compile: ->
    {
      type: "EmptyStatement"
      kind: "ChangeRootNote"
    }

  parse: (parser, token) ->
    parser.setParseToken()

    newRoot = parser.consume()
    parser.setRootNote(newRoot.note)

    @compile()

class DeclarationParselet extends PrefixParselet
  constructor: ->
    @precedence = Precedence.ASSIGNMENT

  compile: (declaration) ->
    {
      type: "VariableDeclaration"
      kind: "var"
      declarations: [declaration]
    }

  parse: (parser, token) ->
    parser.setParseToken()

    nameToken = parser.consume()
    typeToken = parser.consume()

    type = switch typeToken.wholeInterval()
      when "Second" then "Number"
      when "Third" then "String"
      when "Fourth" then "Number"
      else null

    declaration =
      type: "VariableDeclarator"
      id:
        type: "Identifier"
        name: nameToken.note.variableNoteName()
      init:
        type: "NewExpression"
        callee:
          type: "Identifier"
          name: type
        arguments: []

    @compile(declaration)

class AssignParselet extends DeclarationParselet
  compile: (declaration, right)->
    declaration = declaration
    declaration.init = right

    {
      type: "VariableDeclaration"
      kind: "var"
      declarations: [declaration]
    }

  parse: (parser, token) ->
    parser.setParseToken()

    nameToken = parser.consume()
    right = parser.parseExpression(Precedence.ASSIGNMENT - 1)

    declaration =
      type: "VariableDeclarator"
      id:
        type: "Identifier"
        name: nameToken.note.variableNoteName()

    @compile(declaration, right)

class VariableParselet extends PrefixParselet
  compile: (name) ->
    {
      type: "Identifier"
      name: name
    }

  parse: (parser, token) ->
    parser.setParseToken()

    nameToken = parser.consume()

    name = nameToken.note.variableNoteName()

    @compile(name)

class CharacterParselet extends PrefixParselet
  compile: (name) ->
    {
      type: "Literal"
      value: name
    }

  parse: (parser, token) ->
    characterTokens = []

    parser.setParseToken()
    loop
      token = parser.consume()

      unless token?
        throw new Error("Expected a Perfect Fifth but ran out of notes.")

      if token.interval() is "Perfect Fifth"
        break

      characterTokens.push token

    name = String.fromCharCode(characterTokens.map(
      (token) ->
        token.int()
    ).join(""))

    @compile(name)

class PositiveIntegerParselet extends PrefixParselet
  compile: (number) ->
    {
      type: "Literal"
      value: number
    }

  parse: (parser, token) ->
    intTokens = []

    parser.setParseToken()
    loop
      token = parser.consume()

      unless token?
        throw new Error("Expected a Perfect Fifth but ran out of notes.")

      if token.interval() is "Perfect Fifth"
        break

      intTokens.push token

    number = parseInt(intTokens.map(
      (token) ->
        token.int()
    ).join(""))

    @compile(number)

class NegativeIntegerParselet extends PositiveIntegerParselet
  compile: (number) ->
    {
      type: "UnaryExpression"
      operator: "-"
      prefix: true
      argument:
        type: "Literal"
        value: number
    }

class PositiveDoubleParselet extends PrefixParselet
  compile: (number) ->
    {
      type: "Literal"
      value: number
    }

  parse: (parser, token) ->
    integerTokens = []
    fractionTokens = []

    parser.setParseToken()
    decimalExists = no

    loop
      token = parser.consume()

      unless token?
        throw new Error("Expected a Perfect Fifth but ran out of notes.")

      if token.interval() is "Perfect Fifth"
        unless decimalExists
          decimalExists = yes
          continue
        else
          break

      if not decimalExists
        integerTokens.push token
      else
        fractionTokens.push token

    asInt = (token) -> token.int()

    integer = integerTokens.map(asInt).join("")
    fraction = fractionTokens.map(asInt).join("")

    number = parseFloat([integer, fraction].join("."))

    @compile(number)

class NegativeDoubleParselet extends PositiveDoubleParselet
  compile: (number) ->
    {
      type: "UnaryExpression"
      operator: "-"
      prefix: true
      argument:
        type: "Literal"
        value: number
    }

class NotPrefixParselet extends PrefixParselet
  constructor: ->
    @precedence = Precedence.PREFIX

  compile: (expression) ->
    {
      type: "UnaryExpression"
      operator: "!"
      prefix: true
      argument: expression
    }

  parse: (parser, token) ->
    expression = parser.parseExpression()

    @compile(expression)

class GroupParselet extends PrefixParselet
  constructor: ->
    @precedence = Precedence.PREFIX

  compile: (expression) ->
    expression

  parse: (parser, token) ->
    expression = parser.parseExpression()
    parser.consume("RIGHT_PAREN")

    @compile(expression)

class ProgramParselet extends PrefixParselet
  compile: (ast) ->
    {
      type: "Program"
      body: ast
    }

  parse: (parser, token) ->
    ast = []

    while not parser.match(null)
      ast.push parser.parseCommand()

      break if parser.match(null)

      parser.rewind()
      parser.setParseCommand()
      parser.consume "START"

    @compile(ast)

class PrintParselet extends PrefixParselet
  compile: (args) ->
    {
      type: "ExpressionStatement"
      expression:
        type: "CallExpression"
        callee:
          type: "MemberExpression"
          computed: false
          object:
            name: "Velato"
            type: "Identifier"
          property:
            name: "output"
            type: "Identifier"
        arguments: args
    }

  parse: (parser, token) ->
    args = [parser.parseExpression()]

    @compile(args)

class ConditionalParselet extends PrefixParselet
  constructor: ->
    @precedence = Precedence.CONDITIONAL

  compile: (test, consequent, alternate) ->
    baseStatement = {
      type: "IfStatement"
      test: test
      consequent:
        type: "BlockStatement"
        body: consequent
      alternate: null
    }

    if alternate?
      baseStatement.alternate =
        type: "BlockStatement"
        body: alternate

    baseStatement

  parse: (parser, token) ->
    test = parser.parseExpression()

    parser.rewind()
    parser.setParseCommand()
    parser.consume("START")

    consequent = []
    alternate = null

    parsingElse = false
    loop
      if parser.match(null)
        throw new Error("Reached end of statement without end bracket.")
      if parser.match("ELSE")
        parser.consume()
        alternate = []
        parsingElse = true

      if parser.match("END_IF")
        parser.consume()
        break

      if parsingElse
        alternate.push parser.parseCommand(Precedence.CONDITIONAL - 1)
      else
        consequent.push parser.parseCommand()

      parser.rewind()
      parser.setParseCommand()
      parser.consume "START"

    @compile(test, consequent, alternate)

class WhileParselet extends PrefixParselet
  compile: (test, body) ->
    {
      type: "WhileStatement"
      test: test
      body:
        type: "BlockStatement"
        body: body
      alternate: null
    }

  parse: (parser, token) ->
    test = parser.parseExpression()

    parser.rewind()
    parser.setParseCommand()
    parser.consume("START")

    body = []

    loop
      if parser.match(null)
        throw new Error("Reached end of statement without end bracket.")
      if parser.match("END_WHILE")
        parser.consume()
        break

      body.push parser.parseCommand()

      parser.rewind()
      parser.setParseCommand()
      parser.consume "START"

    @compile(test, body)

class BinaryOperatorParselet extends InfixParselet
  constructor: (@type, @op, @precedence) ->

  compile: (left, right) ->
    type: "BinaryExpression"
    operator: @op
    left: left
    right: right

  parse: (parser, left, token) ->
    right = parser.parseExpression @precedence

    @compile(left, right)

class LogicalOperatorParselet extends BinaryOperatorParselet
  constructor: (@type, @op, @precedence) ->

  compile: (left, right) ->
    type: "LogicalExpression"
    operator: @op
    left: left
    right: right

class MathParselet extends BinaryOperatorParselet
  compile: (left, right) ->
    {
      type: "CallExpression"
      callee:
        type: "MemberExpression"
        computed: false
        object:
          name: "Math"
          type: "Identifier"
        property:
          name: @op
          type: "Identifier"
      arguments: [left, right]
    }

  constructor: (@op) ->
    @precedence = Precedence.EXPONENT

window.Velato ||= {}
window.Velato.Parser = VelatoParser

window.Velato.compileAST = (text) ->
  expr = new Velato.Parser(new Velato.Lexer(text)).parseProgram()

window.Velato.compileJS = (text) ->
  window.escodegen.generate(Velato.compileAST(text))

window.Velato.output = (args) ->
  console.log(args)

window.Velato.parsingStarted = ->
