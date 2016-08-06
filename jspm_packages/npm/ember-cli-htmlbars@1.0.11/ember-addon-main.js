/* */ 
(function(process) {
  'use strict';
  var path = require('path');
  var checker = require('ember-cli-version-checker');
  var utils = require('./utils');
  module.exports = {
    name: 'ember-cli-htmlbars',
    init: function() {
      if (this._super.init) {
        this._super.init.apply(this, arguments);
      }
      checker.assertAbove(this, '0.1.2');
    },
    parentRegistry: null,
    shouldSetupRegistryInIncluded: function() {
      return !checker.isAbove(this, '0.2.0');
    },
    setupPreprocessorRegistry: function(type, registry) {
      registry.remove('template', 'broccoli-ember-hbs-template-compiler');
      registry.add('template', {
        name: 'ember-cli-htmlbars',
        ext: 'hbs',
        _addon: this,
        toTree: function(tree) {
          var htmlbarsOptions = this._addon.htmlbarsOptions();
          return require('./index')(tree, htmlbarsOptions);
        },
        precompile: function(string) {
          var htmlbarsOptions = this._addon.htmlbarsOptions();
          var templateCompiler = htmlbarsOptions.templateCompiler;
          return utils.template(templateCompiler, string);
        }
      });
      if (type === 'parent') {
        this.parentRegistry = registry;
      }
    },
    included: function(app) {
      this._super.included.apply(this, arguments);
      if (this.shouldSetupRegistryInIncluded()) {
        this.setupPreprocessorRegistry('parent', app.registry);
      }
    },
    projectConfig: function() {
      return this.project.config(process.env.EMBER_ENV);
    },
    templateCompilerPath: function() {
      var config = this.projectConfig();
      var templateCompilerPath = config['ember-cli-htmlbars'] && config['ember-cli-htmlbars'].templateCompilerPath;
      var ember = this.project.findAddonByName('ember-core');
      if (ember) {
        return ember.absolutePaths.templateCompiler;
      } else if (!templateCompilerPath) {
        templateCompilerPath = this.project.bowerDirectory + '/ember/ember-template-compiler';
      }
      var absolutePath = path.resolve(this.project.root, templateCompilerPath);
      if (path.extname(absolutePath) === '') {
        absolutePath += '.js';
      }
      return absolutePath;
    },
    htmlbarsOptions: function() {
      var projectConfig = this.projectConfig() || {};
      var EmberENV = projectConfig.EmberENV || {};
      var templateCompilerPath = this.templateCompilerPath();
      delete require.cache[templateCompilerPath];
      global.EmberENV = EmberENV;
      var htmlbarsOptions = {
        isHTMLBars: true,
        EmberENV: EmberENV,
        templateCompiler: require(templateCompilerPath),
        templateCompilerPath: templateCompilerPath,
        plugins: {ast: this.astPlugins()}
      };
      delete require.cache[templateCompilerPath];
      delete global.Ember;
      delete global.EmberENV;
      return htmlbarsOptions;
    },
    astPlugins: function() {
      var pluginWrappers = this.parentRegistry.load('htmlbars-ast-plugin');
      var plugins = pluginWrappers.map(function(wrapper) {
        return wrapper.plugin;
      });
      return plugins;
    }
  };
})(require('process'));
