class WysiHat.Editor
  constructor: ($textarea) ->
    @$el = $("<div id=\"" + $textarea.attr("id") + "_editor" + "\" class=\"editor\" contentEditable=\"true\"></div>")
    @$el.html WysiHat.Formatting.getBrowserMarkupFrom($textarea.val())

    $textarea.before @$el
    $textarea.hide()
    $textarea.closest("form").submit (e) =>
      e.preventDefault();
      console.log WysiHat.Formatting.getApplicationMarkupFrom(@$el)
      $textarea.val WysiHat.Formatting.getApplicationMarkupFrom(@$el)

    # WysiHat.BrowserFeatures.run()
    @toolbar = new WysiHat.Toolbar(@)

    $.extend @$el,
      commands: WysiHat.Commands
      states: WysiHat.States
      execCommand: WysiHat.ExecCommand
