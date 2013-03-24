WysiHat = {}

# Set wysihat as a jQuery plugin
$.fn.wysihat = ->
  result = undefined
  @each ->
    $editor = WysiHat.Editor.attach($(this))
    $editor.toolbar = new WysiHat.Toolbar($editor)
    $(@).data('wysihat', result)
