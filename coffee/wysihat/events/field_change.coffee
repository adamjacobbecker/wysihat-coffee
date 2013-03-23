$(document).ready ->
  fieldChangeHandler = (event, element) ->
    $element = $(element)
    element = $element.get(0)
    value = undefined
    value = $element.html()  if $element.attr("contentEditable") is "true"
    value = $element.val()

    # TODO: where did previousValue come from? Guessing it's with contentEditable
    if value and element.previousValue isnt value
      $element.trigger "field:change"
      element.previousValue = value
  $("input,textarea,*[contenteditable=\"\"],*[contenteditable=true]").keyup fieldChangeHandler
