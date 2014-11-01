describe "Lexer", ->
  describe "#tokens", ->
    T = Velato.Token
    N = Velato.Note

    it "using a C base note matches an A, G# and a Bb note", ->
      a = new T(new N("C"), new N("A"), 2)
      gs = new T(new N("C"), new N("G#"), 4)
      bb =new T(new N("C"), new N("Bb"), 7)

      tokens = new Velato.Lexer("C A G# Bb")

      expect(tokens.nextToken()).toEqual(a)
      expect(tokens.nextToken()).toEqual(gs)
      expect(tokens.nextToken()).toEqual(bb)
      expect(tokens.nextToken()).toEqual(null)

    it "using a C base matches a print command based on a set of semitone distance", ->
      tokens = new Velato.Lexer("C A G")

      a = new T(new N("C"), new N("A"), 2)
      g = new T(new N("C"), new N("G"), 4)
      printCommand = {statementName: "PRINT", startToken: a, endToken: g}

      expect(tokens.nextCommand()).toEqual(printCommand)
      expect(tokens.nextCommand()).toEqual(null)

    it "using a C base matches a GreaterThan expression", ->
      tokens = new Velato.Lexer("C C#  E")

      cs = new T(new N("C"), new N("C#"), 2)
      e = new T(new N("C"), new N("E"), 6)
      greaterThanExpression = {statementName: "GT", startToken: cs, endToken: e}

      expect(tokens.nextExpression()).toEqual(greaterThanExpression)
