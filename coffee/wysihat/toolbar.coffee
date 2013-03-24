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
    @observeButtonClick button, @buttonHandler(options["name"], options)
    @observeStateChanges button, @buttonStateHandler(options["name"], options)

  createButtonElement: (options) ->
    button = $("<a class=\"btn btn-mini\" href=\"#\">" + options["label"] + "</a>")
    @$el.append button

    if options["hotkey"] then @editor.$el.bind 'keydown', options["hotkey"], (e) ->
      button.click()
      e.preventDefault()

    button

  ###
  WysiHat.Toolbar#buttonHandler(name, options) -> Function
  - name (String): Name of button command: 'bold', 'italic'
  - options (Hash): Options hash that pass from addButton

  Returns the button handler function to bind to the buttons onclick
  event. It checks the options for a 'handler' attribute otherwise it
  defaults to a function that calls execCommand with the button name.
  ###
  buttonHandler: (name, options) ->
    (editor) ->
      editor.commands[name].call(editor)

  ###
  WysiHat.Toolbar#observeButtonClick(element, handler) -> undefined
  - element (Element): Button element
  - handler (Function): Handler function to bind to element

  Bind handler to elements onclick event.
  ###
  observeButtonClick: (element, handler) ->
    $(element).click =>
      handler @editor.$el

      #event.stop();
      $(document.activeElement).trigger "selection:change"
      false


  ###
  WysiHat.Toolbar#buttonStateHandler(name, options) -> Function
  - name (String): Name of button command: 'bold', 'italic'
  - options (Hash): Options hash that pass from addButton

  Returns the button handler function that checks whether the button
  state is on (true) or off (false). It checks the options for a
  'query' attribute otherwise it defaults to a function that calls
  queryCommandState with the button name.
  ###
  buttonStateHandler: (name, options) ->
    (editor) ->
      editor.states.queryCommandState.call(editor, name)

  ###
  WysiHat.Toolbar#observeStateChanges(element, name, handler) -> undefined
  - element (Element): Button element
  - name (String): Button name
  - handler (Function): State query function

  Determines buttons state by calling the query handler function then
  calls updateButtonState.
  ###
  observeStateChanges: (element, handler) ->
    previousState = undefined
    @editor.$el.bind "selection:change", =>
      state = handler(@editor.$el)
      unless state is previousState
        previousState = state
        @updateButtonState element, state


  ###
  WysiHat.Toolbar#updateButtonState(element, name, state) -> undefined
  - element (Element): Button element
  - name (String): Button name
  - state (Boolean): Whether button state is on/off

  If the state is on, it adds a 'selected' class to the button element.
  Otherwise it removes the 'selected' class.

  You can override this method to change the class name or styles
  applied to buttons when their state changes.
  ###
  updateButtonState: (elem, state) ->
    if state
      $(elem).addClass "active"
    else
      $(elem).removeClass "active"

