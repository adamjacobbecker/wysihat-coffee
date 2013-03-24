class WysiHat.Editor
  constructor: ($textarea) ->
    @$el = $("<div id=\"" + $textarea.attr("id") + "_editor" + "\" class=\"editor\" contentEditable=\"true\"></div>")
    $textarea.before @$el
    @$el.html WysiHat.Formatting.getBrowserMarkupFrom($textarea.val())

    # WysiHat.BrowserFeatures.run()
    @toolbar = new WysiHat.Toolbar(@)

    jQuery.extend @$el,
      commands: WysiHat.Commands
      states: WysiHat.States
      styleSelectors: WysiHat.StyleSelectors
      execCommand: WysiHat.ExecCommand

    $textarea.hide()
    $textarea.closest("form").submit ->
      $textarea.val WysiHat.Formatting.getApplicationMarkupFrom($editArea)
