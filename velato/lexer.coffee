class Lexer
  constructor: (@source) ->
    @clearReplay()
    @setCurrentRoot @nextToken().note
    @clearReplay()

  setCurrentRoot: (note) ->
    @_currentRoot = note

  currentRoot: ->
    @_currentRoot

  tokenSearch: ->
    /([a-g][#b]?)/img

  clearReplay: ->
    @_replayIndex = null
    @_replayTokens = []

  rewind: ->
    @_replayIndex = 0

  nextToken: ->
    if @_replayIndex? and @_replayIndex <= @_replayTokens.length - 1
      return @_replayTokens[@_replayIndex++]

    @_search ||= @tokenSearch()

    match = @_search.exec(@source)

    if match?
      token = new Velato.Token(
        @currentRoot(),
        new Velato.Note(match[0]),
        match.index)

      @_replayTokens.push(token)

      token
    else
      null

  nextStatement: (statements, wholeTones=off) ->
    index = 0

    statementNames = (statementName for statementName, statement of statements)

    startToken = @nextToken()
    token = startToken

    while statementNames.length > 0 and token?
      nextStatementNames = []
      for statementName in statementNames
        path = statements[statementName].path
        statementSemitone = path[index]?.type

        if statementSemitone is token.interval() or (wholeTones and (statementSemitone is token.wholeInterval()))
          if index is path.length - 1
            return {
              statementName: statementName
              startToken: startToken
              endToken: token
            }

          nextStatementNames.push statementName

      statementNames = nextStatementNames

      token = @nextToken()
      index++

    null

  next: ->
    @nextCommand()

  nextExpression: ->
    @nextStatement( Velato.expressions(), on )

  nextCommand: ->
    @nextStatement( Velato.commands() )

window.Velato ||= {}
window.Velato.Lexer = Lexer
