module.exports = (grunt) ->

  tasks = 'coffee concat'

  path = require('path')
  exec = require('child_process').exec

  grunt.loadNpmTasks('grunt-coffee')

  grunt.initConfig

    pkg: '<json:package.json>'

    coffee:
      all:
        src: ['./coffee/*.coffee']
        dest: './js'
        options:
          bare: true

    concat:
      all:
        src: [
          './js/wysihat.js'
          './js/wysihat/dom/ierange.js'
          './js/wysihat/dom/range.js'
          './js/wysihat/dom/selection.js'
          './js/wysihat/dom/bookmark.js'
          './js/wysihat/editor.js'
          './js/wysihat/features.js'
          './js/wysihat/commands.js'
          './js/wysihat/element/sanitize_contents.js'
          './js/wysihat/events/field_change.js'
          './js/wysihat/events/frame_loaded.js'
          './js/wysihat/events/selection_change.js'
          './js/wysihat/formatting.js'
          './js/wysihat/toolbar.js'
          './js/helper.js'
        ]
        dest: './dist/wysihat.js'

    watch:
      app:
        files: ['./coffee/**/*.coffee'],
        tasks: tasks

  grunt.registerTask('default', tasks)
