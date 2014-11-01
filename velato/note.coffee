class Note
  constructor: (noteName) ->
    if typeof(noteName) is "string"
      @noteName = @constructor.capitalize(noteName)
    else if typeof(noteName) is "object" and noteName.length <= 2
      @noteName = noteName.map(@constructor.capitalize)
    else
      throw new Error("Unrecognized note name.")

  @capitalize: (name) ->
    name.charAt(0).toUpperCase() + name.slice(1)

  variableNoteName: ->
    @noteName.replace(/#/, "s")

  asInt: (rootNote) ->
    distance = @semitoneDistance(rootNote)

    ###
    # In the Root of C
    # c#  d  d# e f f# g g# a a# b
    # 0   1  2  3 4 5  - 6  7 8  9
    ###
    intervalTable = ["Minor Second", "Major Second", "Minor Third", "Major Third", "Perfect Fourth", "Augmented Fourth, Diminished Fifth", "Minor Sixth", "Major Sixth", "Minor Seventh", "Major Seventh"]

    int = intervalTable.indexOf(distance.interval)

    if int is -1
      return null

    int

  semitoneDistance: (rootNote) ->
    @constructor.semitoneDistance(rootNote, this)

  @_intervals: ->
    """
    0-Perfect Prime
    1-Minor Second
    2-Major Second
    3-Minor Third
    4-Major Third
    5-Perfect Fourth
    6-Augmented Fourth, Diminished Fifth
    7-Perfect Fifth
    8-Minor Sixth
    9-Major Sixth
    10-Minor Seventh
    11-Major Seventh
    12-Perfect Octave
    """.split(/\n/).map(
      (n) ->
        [semitoneCount, interval] = n.split("-")
        {semitoneCount: parseInt(semitoneCount), interval: interval}
    )

  @fromIntervalName: (root, intervalName) ->
    @noteFromSemitoneCount(root, @interval(intervalName).semitoneCount)

  @interval: (intervalName) ->
    intervals = @_intervals()

    for interval in intervals
      if interval.interval is intervalName
        return interval

    null

  @semitoneDistance: (rootNote, note) ->
    intervals = @_intervals()

    distance = @rawSemitoneDistance(rootNote, note)
    for interval in intervals
      if interval.semitoneCount is distance
        return interval

    null

  @noteFromSemitoneCount: (rootNote, semitoneCount) ->
    rootName = rootNote.noteName
    scale = @chromaticScale(rootName)

    firstIndex = null
    selectedNote = null

    for scaleNote, i in scale
      if scaleNote.indexOf(rootName) isnt -1
        firstIndex = i
        break

    for scaleNote, i in scale
      offset = 0
      if firstIndex > i
        offset += scale.length

      if (i + offset) - firstIndex is semitoneCount
        selectedNote = new Velato.Note(scaleNote)

    selectedNote

  @rawSemitoneDistance: (rootNote, note) ->
    rootName = rootNote.noteName
    noteName = note.noteName

    scale = @chromaticScale(rootName)

    firstIndex = null
    secondIndex = null

    newIndex = 0
    for scaleNote in scale
      newIndex += 1
      for exactNote in scaleNote
        if exactNote is rootName
          firstIndex = newIndex
        if exactNote is noteName
          secondIndex = newIndex

    if firstIndex > secondIndex
      secondIndex += scale.length + 1

    secondIndex - firstIndex

  @chromaticScale: (rootNote) ->
    @scale(rootNote, [1...12].map(-> "h").join(" "))

  @scale: (rootNoteName, semitoneOffsets) ->
    semitones = semitoneOffsets.split(/\s/).map( (step) -> if step is "w" then 2 else 1 )
    availableNotes = "C C#/Db D D#/Eb E E#/F F#/Gb G G#/Ab A A#/Bb B/Cb".split(/\s/).map (note) -> note.split(/\//)

    currentNote = null
    for note, i in availableNotes
      if note.indexOf(rootNoteName) isnt -1
        currentNote = i
        break

    noteScale = [ availableNotes[currentNote] ]

    for semitoneDistance in semitones
      currentNote += semitoneDistance
      if currentNote >= availableNotes.length
        currentNote -= availableNotes.length

      noteScale.push availableNotes[currentNote]

    noteScale

  @major: (rootNoteName) ->
    @scale base, "w w h w w w h"

  @minor: (rootNoteName) ->
    @scale base, "w h w w h w w"

window.Velato ||= {}
window.Velato.Note = Note
