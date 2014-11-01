# MAYBEDO

Some ideas which might be useful.

---

Add in source locations for all the identifiers:

```
loc:
  source: ""
  start: nameToken.position
  end: typeToken.position
```

---

Unify the way tokens are handled, some are tokens which correspond to commands and some are raw notes.

`nameToken.note -> token.startToken`

---

Remove calls where the note of a token is accessed directly.

`nameToken.note.noteName`

---

Find a way to avoid having three types of things to parse:

`parseCommand -> parseExpression -> parseToken`

The expressions are almost all infix while the commands are prefix for the most part.

---

Are there other methods to handle the unary `!` operator?

---

Maybe put some of the parsers in separate files? Like a sane robot.
