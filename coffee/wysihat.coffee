WysiHat = { Helpers: {} }

# Set wysihat as a jQuery plugin
$.fn.wysihat = ->
  @each ->
    $(@).data 'wysihat', new WysiHat.Editor($(@))
