class Token
  constructor: (@root, @note, @position) ->

  interval: ->
    @note.semitoneDistance(@root).interval

  wholeInterval: ->
    @note.semitoneDistance(@root).interval.split(/\s/)?.pop()

  int: ->
    @note.asInt(@root)

window.Velato ||= {}
window.Velato.Token = Token
