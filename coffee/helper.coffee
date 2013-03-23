camelize = (s) ->
  camel = s.trim().replace(/(\-|_|\s)+(.)?/g, (mathc, sep, c) ->
    (if c then c.toUpperCase() else "")
  )
  camel

@camelize = camelize

capitalize = (s) ->
  return s.substr(0, 1).toUpperCase() + s.substring(1).toLowerCase()

@capitalize = capitalize

wysiHatify = (tag_id, buttons) ->
  editor = WysiHat.Editor.attach ($ tag_id)
  toolbar = new WysiHat.Toolbar editor
  toolbar.initialize editor

  for button in buttons
    toolbar.addButton label: @capitalize @camelize(button)

  editor.toolbar = toolbar

@wysiHatify = wysiHatify
