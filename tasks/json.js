/**
 * grunt-json
 * https://github.com/wilsonpage/grunt-json
 *
 * Copyright (c) 2012 Wilson Page
 * Licensed under the MIT license.
 *
 * Edited by @lesterzone
 */

'use strict';

module.exports = function(grunt) {
    var path, defaultProcessNameFunction;

    path = require('path');

    defaultProcessNameFunction = function(name) {
        return name;
    };

    var concatJson = function(files, data) {
        /**
         * Options object from configuration
         */
        var options = data.options,

            /**
             * Allows the user to customize the namespace but will have a
             * default if one is not given.
             */
            namespace = options && options.namespace || 'myjson',

            /**
             * Allow user to include full path of the file and the extension
             */
            includePath = options && options.includePath || false,


            /**
             * Allows the user to modify the path/name that will be used as the
             * identifier.
             */
            processName = options.processName || defaultProcessNameFunction,

            /**
             * Display var or not, if user is using a namespace to join files
             */
            displayVar = namespace.indexOf('.') === -1 ? 'var ' : '',

            /**
             * Namespace definition
             */
            defineVar = namespace + ' = ' + namespace + ' || {};\n',

            basename, filename, fileContent;


        return displayVar + defineVar + files.map(function(filepath) {
            basename = path.basename(filepath, '.json');
            filename = processName(includePath ? filepath : basename);
            fileContent = grunt.file.read(filepath);
            return namespace + '.' + filename + ' = ' + fileContent + ';\n';
        }).join('');
    };

    /**
     * Grunt task
     */
    grunt.registerMultiTask('json', 'Concatenating JSON into JS', function() {
        var data = this.data;

        grunt.util.async.forEachSeries(this.files, function(file) {
            var destFile = file.dest,
                files;

            files = file.src.filter(function(filepath) {

                /**
                 * Warn on and remove invalid source files (if nonull was set).
                 */
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file ' + filepath + ' not found.');
                    return false;
                }
                return true;
            });

            var json = concatJson(files, data);
            grunt.file.write(destFile, json);
            grunt.log.write('File ' + destFile + ' created.');
        });
    });
};
