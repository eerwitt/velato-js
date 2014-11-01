expressions = ->
  START:
    path: [
      {type: "Perfect Prime"}
    ]
  EQUAL:
    path: [
      {type: "Second"}
      {type: "Second"}
    ]
  GT:
    path: [
      {type: "Second"}
      {type: "Third"}
    ]
  LT:
    path: [
      {type: "Second"}
      {type: "Fourth"}
    ]
  NOT:
    path: [
      {type: "Second"}
      {type: "Fifth"}
    ]
  AND:
    path: [
      {type: "Second"}
      {type: "Sixth"}
    ]
  OR:
    path: [
      {type: "Second"}
      {type: "Seventh"}
    ]
  VARIABLE:
    path: [
      {type: "Third"}
      {type: "Second"}
    ]
  POSITIVE_INT:
    path: [
      {type: "Third"}
      {type: "Fifth"}
    ]
  NEGATIVE_INT:
    path: [
      {type: "Third"}
      {type: "Third"}
    ]
  CHARACTER:
    path: [
      {type: "Third"}
      {type: "Fourth"}
    ]
  POSITIVE_DOUBLE:
    path: [
      {type: "Third"}
      {type: "Sixth"}
    ]
  NEGATIVE_DOUBLE:
    path: [
      {type: "Third"}
      {type: "Seventh"}
    ]
  PLUS:
    path: [
      {type: "Fifth"}
      {type: "Fifth"}
      {type: "Third"}
    ]
  MINUS:
    path: [
      {type: "Fifth"}
      {type: "Fifth"}
      {type: "Second"}
    ]
  MULTIPLY:
    path: [
      {type: "Fifth"}
      {type: "Fifth"}
      {type: "Fifth"}
    ]
  DIVIDE:
    path: [
      {type: "Fifth"}
      {type: "Fifth"}
      {type: "Fourth"}
    ]
  MOD:
    path: [
      {type: "Fifth"}
      {type: "Fifth"}
      {type: "Sixth"}
    ]
  POW:
    path: [
      {type: "Fifth"}
      {type: "Seventh"}
      {type: "Second"}
    ]
  LOG:
    path: [
      {type: "Fifth"}
      {type: "Seventh"}
      {type: "Third"}
    ]
  LEFT_PAREN:
    path: [
      {type: "Sixth"}
      {type: "Sixth"}
      {type: "Sixth"}
    ]
  RIGHT_PAREN:
    path: [
      {type: "Sixth"}
      {type: "Sixth"}
      {type: "Second"}
    ]

commands = ->
  START:
    path: [
      {type: "Perfect Prime"}
    ]
  CHANGE_ROOT_NODE:
    path: [
      {type: "Major Second"}
    ]
  ASSIGN:
    path: [
      {type: "Minor Third"}
    ]
  DECLARE:
    path: [
      {type: "Minor Sixth"}
    ]
  WHILE:
    path: [
      {type: "Major Third"}
      {type: "Major Third"}
    ]
  END_WHILE:
    path: [
      {type: "Major Third"}
      {type: "Perfect Fourth"}
    ]
  IF:
    path: [
      {type: "Major Third"}
      {type: "Perfect Fifth"}
    ]
  ELSE:
    path: [
      {type: "Major Third"}
      {type: "Major Sixth"}
    ]
  END_IF:
    path: [
      {type: "Major Third"}
      {type: "Major Seventh"}
    ]
  PRINT:
    path: [
      {type: "Major Sixth"}
      {type: "Perfect Fifth"}
    ]

window.Velato ||= {}
window.Velato.commands = commands
window.Velato.expressions = expressions
