class WysiHat.Toolbar
  constructor: (editor) ->
    @editor = editor
    @createToolbarElement()
    @addButtonSet()

  createToolbarElement: ->
    @$el = $("<div class=\"editor_toolbar\"></div>")
    @editor.$el.before @$el

  addButtonSet: ->
    set = [
      name: "bold"
      label: "<strong>Bold</strong>"
      hotkey: 'meta+b ctrl+b'
    ,
      name: "italic"
      label: "<em>Italic</em>"
      hotkey: 'meta+i ctrl+i'
    ,
      name: "underline"
      label: "<u>Underline</u>"
      hotkey: 'meta+u ctrl+u'
    ,
      name: "unorderedList"
      label: "<i class='icon-list-ul'></i> Bullets"
    ,
      name: "orderedList"
      label: "<i class='icon-list-ol'></i> Numbers"
    ]

    $(set).each (_, options) =>
      @addButton options

  addButton: (options) ->
    button = @createButtonElement(options)
    @observeButtonClick button, @buttonHandler(options["name"])
    @observeStateChanges button, @buttonStateHandler(options["name"])

  createButtonElement: (options) ->
    button = $("<a class=\"btn btn-mini\" href=\"#\">" + options["label"] + "</a>")
    @$el.append button

    if options["hotkey"] then @editor.$el.bind 'keydown', options["hotkey"], (e) ->
      button.click()
      e.preventDefault()

    button

  buttonHandler: (name) ->
    (editor) ->
      editor.commands[name].call(editor)

  observeButtonClick: (element, handler) ->
    $(element).click =>
      handler @editor.$el

      #event.stop();
      $(document.activeElement).trigger "selection:change"
      false

  buttonStateHandler: (name, options) ->
    (editor) ->
      editor.states.queryCommandState.call(editor, name)

  observeStateChanges: (element, handler) ->
    previousState = undefined
    @editor.$el.bind "selection:change", =>
      state = handler(@editor.$el)
      unless state is previousState
        previousState = state
        @updateButtonState element, state

  updateButtonState: (elem, state) ->
    if state
      $(elem).addClass "active"
    else
      $(elem).removeClass "active"
