###
section: wysihat
class WysiHat.Toolbar
###
class WysiHat.Toolbar

  ###
  new WysiHat.Toolbar(ed)
  - ed (WysiHat.Editor): the editor object that you want to attach to.

  This was renamed from 'editor' in the original wysihat code, since I
  had to add a class level 'editor' object, causing a conflict with the
  names.

  Creates a toolbar element above the editor. The WysiHat.Toolbar object
  has many helper methods to easily add buttons to the toolbar.

  This toolbar class is not required for the Editor object to function.
  It is merely a set of helper methods to get you started and to build
  on top of. If you are going to use this class in your application,
  it is highly recommended that you subclass it and override methods
  to add custom functionality.
  ###
  constructor: (ed) ->
    @editor = ed
    @element = @createToolbarElement()

  ###
  WysiHat.Toolbar#createToolbarElement() -> Element

  Creates a toolbar container element and inserts it right above the
  original textarea element. The element is a div with the class
  'editor_toolbar'.

  You can override this method to customize the element attributes and
  insert position. Be sure to return the element after it has been
  inserted.
  ###
  createToolbarElement: ->
    toolbar = $("<div class=\"editor_toolbar\"></div>")
    @editor.before toolbar
    toolbar

  ###
  WysiHat.Toolbar#addButtonSet(set) -> undefined
  - set (Array): The set array contains nested arrays that hold the
  button options, and handler.

  Adds a button set to the toolbar.
  ###
  addButtonSet: (set) ->
    $(set).each (index, button) =>
      @addButton button


  ###
  WysiHat.Toolbar#addButton(options[, handler]) -> undefined
  - options (Hash): Required options hash
  - handler (Function): Function to bind to the button

  The options hash accepts two required keys, name and label. The label
  value is used as the link's inner text. The name value is set to the
  link's class and is used to check the button state. However the name
  may be omitted if the name and label are the same. In that case, the
  label will be down cased to make the name value. So a "Bold" label
  will default to "bold" name.

  The second optional handler argument will be used if no handler
  function is supplied in the options hash.

  toolbar.addButton({
  name: 'bold', label: "Bold" }, function(editor) {
  editor.boldSelection();
  });

  Would create a link,
  "<a href='#' class='button bold'><span>Bold</span></a>"
  ###
  addButton: (options, handler) ->
    options["name"] = options["label"].toLowerCase()  unless options["name"]
    name = options["name"]
    button = @createButtonElement(@element, options)
    handler = @buttonHandler(name, options)
    @observeButtonClick button, handler
    handler = @buttonStateHandler(name, options)
    @observeStateChanges button, name, handler

  ###
  WysiHat.Toolbar#createButtonElement(toolbar, options) -> Element
  - toolbar (Element): Toolbar element created by createToolbarElement
  - options (Hash): Options hash that pass from addButton

  Creates individual button elements and inserts them into the toolbar
  container. The default elements are 'a' tags with a 'button' class.

  You can override this method to customize the element attributes and
  insert positions. Be sure to return the element after it has been
  inserted.
  ###
  createButtonElement: (toolbar, options) ->
    button = $("<a class=\"btn btn-mini\" href=\"#\">" + options["label"] + "</a>")
    toolbar.append button
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
    if options.handler
      options.handler
    else if options["handler"]
      options["handler"]
    else
      (editor) ->
        editor.execCommand name

  ###
  WysiHat.Toolbar#observeButtonClick(element, handler) -> undefined
  - element (Element): Button element
  - handler (Function): Handler function to bind to element

  Bind handler to elements onclick event.
  ###
  observeButtonClick: (element, handler) ->
    $(element).click =>
      handler @editor

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
    if options.query
      options.query
    else if options["query"]
      options["query"]
    else
      (editor) ->
        editor.queryCommandState name

  ###
  WysiHat.Toolbar#observeStateChanges(element, name, handler) -> undefined
  - element (Element): Button element
  - name (String): Button name
  - handler (Function): State query function

  Determines buttons state by calling the query handler function then
  calls updateButtonState.
  ###
  observeStateChanges: (element, name, handler) ->
    previousState = undefined
    @editor.bind "selection:change", =>
      state = handler(@editor)
      unless state is previousState
        previousState = state
        @updateButtonState element, name, state


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
  updateButtonState: (elem, name, state) ->
    if state
      $(elem).addClass "active"
    else
      $(elem).removeClass "active"


###
WysiHat.Toolbar.ButtonSets

A namespace for various sets of Toolbar buttons. These sets should be
compatible with WysiHat.Toolbar, and can be added to the toolbar with:
toolbar.addButtonSet(WysiHat.Toolbar.ButtonSets.Basic);
###
WysiHat.Toolbar.ButtonSets = {}

###
WysiHat.Toolbar.ButtonSets.Basic

A basic set of buttons: bold, underline, and italic. This set is
compatible with WysiHat.Toolbar, and can be added to the toolbar with:
toolbar.addButtonSet(WysiHat.Toolbar.ButtonSets.Basic);
###
WysiHat.Toolbar.ButtonSets.Basic = [
  label: "Bold"
,
  label: "Italic"
,
  label: "Underline"
]

###
WysiHat.Toolbar.ButtonSets.Standard

The most common set of buttons that I will be using.
###
WysiHat.Toolbar.ButtonSets.Standard = [
  label: "Bold"
,
  label: "Italic"
,
  label: "Underline"
,
  label: "Bullets"
  handler: (editor) ->
    editor.toggleUnorderedList()
,
  label: "Numbers"
  handler: (editor) ->
    editor.toggleOrderedList()
]