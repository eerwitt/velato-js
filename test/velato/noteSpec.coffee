describe "Velato Note", ->
  it "parses a list of intervals to notes and back", ->
    N = Velato.Note
    root = new N("C")
    command = ["Major Third", "Perfect Fifth", "Major Third", "Minor Second", "Minor Sixth", "Minor Second", "Minor Second", "Major Third", "Minor Second", "Major Second", "Perfect Prime"]
    #command = command.concat ["Major Sixth", "Perfect Fifth", "Minor Third", "Minor Second", "Minor Sixth", "Perfect Prime"]
    #command = command.concat ["Major Third", "Major Sixth", "Perfect Prime"]
    #command = command.concat ["Major Sixth", "Perfect Fifth", "Minor Third", "Major Second", "Major Seventh", "Perfect Prime"]
    #command = command.concat ["Major Third", "Major Seventh", "Perfect Prime"]

    expectedNotes = [
      new N(["E"])
      new N(["G"])
      new N(["E"])
      new N(["C#", "Db"])
      new N(["G#", "Ab"])
      new N(["C#", "Db"])
      new N(["C#", "Db"])
      new N(["E"])
      new N(["C#", "Db"])
      new N(["D"])
      new N(["C"])
    ]
    notes = command.map(
      (c) -> N.interval(c)
    ).map(
      (i) -> N.noteFromSemitoneCount(root, i.semitoneCount))

    expect(notes).toEqual(expectedNotes)
    # s = new Velato.Syntax()
    # s.parse("C E G E C# G# C# C# E C# D C")

  describe "#semitoneDistance", ->
    it "in the root of C, D is a Major Second", ->
      rootNote = new Velato.Note("C")
      note = new Velato.Note("D")

      expect(note.semitoneDistance(rootNote)).toEqual(semitoneCount: 2, interval: 'Major Second')

    it "in the root of F, C# is a Major Third", ->
      rootNote = new Velato.Note("F")
      note = new Velato.Note("C#")

      expect(note.semitoneDistance(rootNote)).toEqual(semitoneCount: 8, interval: 'Minor Sixth')

    it "in the root of C, C is a Perfect Prime", ->
      rootNote = new Velato.Note("C")
      note = new Velato.Note("C")

      expect(note.semitoneDistance(rootNote)).toEqual(semitoneCount: 0, interval: 'Perfect Prime')

  describe "#rawSemitoneDistance", ->
    it "describes an E as 5 semitones above a Cb", ->
      rootNote = new Velato.Note("Cb")
      note = new Velato.Note("E")

      expect(Velato.Note.rawSemitoneDistance(rootNote, note)).toBe(5)

  describe "#noteFromSemitoneCount", ->
    it "in a root of Eb, 5 semitones is a D", ->
      rootNote = new Velato.Note("Eb")

      expect(Velato.Note.noteFromSemitoneCount(rootNote, 5)).toEqual(new Velato.Note(['G#', 'Ab']))

  describe "#scale", ->
    it "lists a basic scale", ->
      scale = Velato.Note.scale("C", "h h h")
      expectedScale = [['C'], ['C#', 'Db'], ['D'], ['D#', 'Eb']]

      expect(scale).toEqual(expectedScale)

  describe "#asInt", ->
    it "parses 0-9 out of a set of notes", ->
      ints = "c# d d# e f f# g# a a# b".split(/\s+/).map( (n) -> new Velato.Note(n).asInt(new Velato.Note("C")))
      expect(ints).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
