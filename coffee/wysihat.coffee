WysiHat = { Helpers: {} }

# Set wysihat as a jQuery plugin
$.fn.wysihat = (opts = {}) ->
  @each ->
    $(@).data 'wysihat', new WysiHat.Editor($(@), opts)
