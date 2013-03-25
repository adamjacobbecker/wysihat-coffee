class WysiHat.Editor
  constructor: ($textarea, opts) ->
    @$el = $("<div id=\"" + $textarea.attr("id") + "_editor" + "\" class=\"editor\" contentEditable=\"true\"></div>")
    @$el.html WysiHat.Formatting.getBrowserMarkupFrom($textarea.val())

    $textarea.before @$el
    $textarea.hide()
    $textarea.closest("form").submit (e) =>
      e.preventDefault();
      $textarea.val WysiHat.Formatting.getApplicationMarkupFrom(@$el)
      opts.onSubmit?()

    # WysiHat.BrowserFeatures.run()
    @toolbar = new WysiHat.Toolbar(@)

    $.extend @$el,
      commands: WysiHat.Commands
      states: WysiHat.States
      execCommand: WysiHat.ExecCommand
