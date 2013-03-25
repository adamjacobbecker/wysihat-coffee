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
    ,
      name: "linked"
      label: "<i class='icon-link'></i> Link"
      handler: (editor, e) ->
        if editor.states.linked()
          editor.destroyCurrentTooltipElement?()
          return editor.commands.unlink.call(editor)

        $btn = $(e.target).closest(".btn")

        destroyPopover = ->
          $(document).off ".popover"
          WysiHat.Helpers.Selection.restore(range)
          editor.highlightApplier.undoToSelection()
          $btn.popover 'destroy'

        return destroyPopover() if $btn.data('popover')

        $btn.popover
          placement: 'bottom'
          template: '<div class="popover"><div class="arrow"></div><div class="popover-content"></div></div>'

          content: """
            <input type="text" value="http://" style="margin-bottom: 0px;" class="span2" />
            <a class="btn btn-primary">Add</a>
          """
          html: true
          trigger: 'manual'

        range = WysiHat.Helpers.Selection.save()
        selection = window.getSelection()
        return if selection.rangeCount == 0
        editor.highlightApplier.applyToSelection()
        range = selection.getRangeAt(0)

        $btn.popover 'show'

        $popover = $btn.data('popover').$tip
        $popover.find(":input").focus().val($popover.find(":input").val()) # hack to focus to end of input
        $(document).on "click.popover", (e) ->
          destroyPopover() if $(e.target).closest(".popover").length is 0
        $(document).on "keydown.popover", "esc", (e) ->
          destroyPopover()

        addLink = ->
          href = $popover.find(":input").val()
          destroyPopover()
          editor.commands.link.call(editor, href)

        $popover.on "click", ".btn", addLink
        $popover.on "keydown", ":input", (e) ->
          switch e.keyCode
            when 27 then destroyPopover()
            when 13
              e.preventDefault()
              addLink()
    ]

    $(set).each (_, options) =>
      @addButton options

  addButton: (options) ->
    button = @createButtonElement(options)
    @observeButtonClick button, options["handler"] || @buttonHandler(options["name"])
    @observeStateChanges button, options["observer"] || @buttonStateHandler(options["name"])

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
    $(element).click (e) =>
      handler @editor.$el, e

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
