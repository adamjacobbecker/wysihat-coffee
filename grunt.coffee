module.exports = (grunt) ->

  tasks = 'coffee concat min'

  path = require('path')
  exec = require('child_process').exec

  grunt.loadNpmTasks('grunt-coffee')

  grunt.initConfig

    pkg: '<json:package.json>'

    coffee:
      all:
        src: ['./coffee/**/*.coffee']
        dest: './js'
        options:
          bare: true
          preserve_dirs: true

    concat:
      all:
        src: [
          './js/coffee/wysihat.js'
          './js/coffee/wysihat/dom/ierange.js'
          './js/coffee/wysihat/dom/range.js'
          './js/coffee/wysihat/dom/selection.js'
          './js/coffee/wysihat/dom/bookmark.js'
          './js/coffee/wysihat/editor.js'
          './js/coffee/wysihat/features.js'
          './js/coffee/wysihat/commands.js'
          './js/coffee/wysihat/states.js'
          './js/coffee/wysihat/element/sanitize_contents.js'
          './js/coffee/wysihat/events/field_change.js'
          './js/coffee/wysihat/events/frame_loaded.js'
          './js/coffee/wysihat/events/selection_change.js'
          './js/coffee/wysihat/formatting.js'
          './js/coffee/wysihat/toolbar.js'
          './js/coffee/wysihat/helpers/selection.js'
          './js/coffee/helper.js'
        ]
        dest: './dist/wysihat.js'

    min:
      all:
        src: './dist/wysihat.js',
        dest: './dist/wysihat.min.js'

    watch:
      app:
        files: ['./coffee/**/*.coffee'],
        tasks: tasks

  grunt.registerTask('default', tasks)
