WysiHat = {}
(($) ->

  # Set wysihat as a jQuery plugin
  $.fn.wysihat = ->
    result = undefined
    @each ->
      $editor = WysiHat.Editor.attach($(this))
      toolbar = new WysiHat.Toolbar($editor)
      $editor.toolbar = toolbar
      if result
        result.add $editor
      else
        result = $editor

    result
) jQuery