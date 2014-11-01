describe "Syntax", ->
  it "parses a print statement", ->
    expect(Velato.compileJS("C A G E E# A D# G")).toBe('Velato.output(\'H\');')

  it "doesn't get confused by a declaration after a print", ->
    expect(Velato.compileJS("C A G E E# A D# G C C A A C B C# D F B E A")).toBe("""
      Velato.output('H');
      ;
      var B = '=';""")

  it "declares and prints a variable", ->
    expect(Velato.compileJS("A C B C# D F# C E A A C C A G Eb C# B")).toBe("""
      var B = 'H';
      ;
      Velato.output(B);
    """)

  it "declares but doesn't define a variable", ->
    expect(Velato.compileJS("C G# B C#")).toBe("var B = new Number();")

  it "declares a variable", ->
    expect(Velato.compileJS("A C B C# D F# C E A")).toBe("var B = 'H';")

  it "creates an if equality statement", ->
    expect(Velato.compileJS("C E G E E# A D# G C# Db E E# A D# G C A G E E# A D# G C E Cb")).toBe("""
    if ('H' == 'H') {
        Velato.output('H');
    }""")

  it "creates an if gt statement", ->
    expect(Velato.compileJS("C E G E E# A D# G D E E E# A D# G C A G E E# A D# G C E Cb")).toBe("""
    if ('H' > 'H') {
        Velato.output('H');
    }""")

  it "creates a hella complex if statement", ->
    expect(Velato.compileJS("""
      C
        E G
          E E# A D# G
          D E#
          E E# A D# G
          D A
          E E# A D# G
          D E
          E E# A D# G
        C
          A G E E# A D# G
        C
          E Cb
    """)).toBe("""
      if ('H' < 'H' && 'H' > 'H') {
          Velato.output('H');
      }""")

  it "adds two variables", ->
    expect(Velato.compileJS("""
      C
        A G
          Eb C# B
          G G D#
          Eb C# B
    """)).toBe("Velato.output(B + B);")

  it "add and multiply in the correct order", ->
    #TODO it seems like instead of caring about precedence this can also use the JS precedence since it is the same
    expect(Velato.compileJS("""
      C
        A G
          Eb C# B
          G G D#
          Eb C# B
          G A# C#
          Eb C# B
          G G C#
          Eb C# B
          G G G
          Eb C# B
          D E
          E E# A D# G
    """)).toBe("Velato.output(B + Math.pow(B, B) - B * (B > 'H'));")

  it "adds a negative and postive integer", ->
    expect(Velato.compileJS("""
      C
        A G
          D# G D D# E G
          G G D#
          D# Eb F# G# A G
    """)).toBe("Velato.output(123 + -567);")

  it "multiplies a negative and positive double", ->
    expect(Velato.compileJS("""
      C
        A G
          D# G# D D# E G F# G# A G
          G G D#
          D# A# F# G# A G A# B C# D G
    """)).toBe("Velato.output(123.567 + -567.8901);")

  it "makes a while loop", ->
    expect(Velato.compileJS("""
    C
      E E
        Eb C# B
        D E
        E E# A D# G
      C
        A G
          D# G D D# E G
      C
        E E#""")).toBe("""
        while (B > 'H') {
            Velato.output(123);
        }""")

  it "uses parens to group addition", ->
    expect(Velato.compileJS("""
    C
      A G
        Eb C# B
        G G C#
        Eb C# B
        G G G
        A A A
          Eb C# B
          G G G
          A A A
            Eb C# B
            G G D#
            Eb C# B
          A A C#
          G G C#
          Eb C# B
          G G G
          Eb C# B
        A A C#
        G G G
        Eb C# B""")).toBe("""
          Velato.output(B - B * (B * (B + B) - B * B) * B);
        """)

  it "negates as a prefix", ->
    expect(Velato.compileJS("""
      C
        E G
          C# G
          E E# A D# G
          C# Db E
          E# A D# G
        C
          A G
            E E# A D# G
        C E Cb""")).toBe("""
        if (!('H' == 'H')) {
            Velato.output('H');
        }""")
