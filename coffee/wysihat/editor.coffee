class WysiHat.Editor
  constructor: ($textarea, opts) ->
    editor = @

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

    rangy.init()

    $.extend @$el,
      commands: WysiHat.Commands
      states: WysiHat.States
      execCommand: WysiHat.ExecCommand
      highlightApplier: rangy.createCssClassApplier("highlighted", true)

    @$el.on "click", "a", (e) ->
      return if $(@).data('tooltip')

      $(@).tooltip
        html: true
        title: "<a href='#{$(@).attr('href')}' target='_blank'>#{$(@).attr('href')}</a>"
        trigger: 'manual'
        container: 'body'

      $(@).tooltip 'show'

      $currentTooltipElement = $(@)

      editor.$el.destroyCurrentTooltipElement = =>
        $(document).off "click", tooltipHandler
        $(@).tooltip 'destroy'

      tooltipHandler = (e) =>
        if $(e.target).closest($(@).data('tooltip').$tip).length is 0
          editor.$el.destroyCurrentTooltipElement()

      $(document).on "click", tooltipHandler

      e.stopPropagation()
