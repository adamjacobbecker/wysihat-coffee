WysiHat = {}
(($) ->

  # Set wysihat as a jQuery plugin
  $.fn.wysihat = (buttons) ->
    buttons = (if typeof (buttons) is "undefined" then WysiHat.Toolbar.ButtonSets.Standard else buttons)
    result = undefined
    @each ->
      $editor = WysiHat.Editor.attach($(this))
      toolbar = new WysiHat.Toolbar($editor)
      toolbar.addButtonSet buttons
      $editor.toolbar = toolbar
      if result
        result.add $editor
      else
        result = $editor

    result
) jQuery