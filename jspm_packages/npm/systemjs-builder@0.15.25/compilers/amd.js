/* */ 
"format cjs";
var System = require('systemjs');
var traceur = require('traceur');
var vm = require('vm');
var traceurGet = require('../lib/utils').traceurGet;
var ParseTreeTransformer = traceurGet('codegeneration/ParseTreeTransformer.js').ParseTreeTransformer;
var parseExpression = traceurGet('codegeneration/PlaceholderParser.js').parseExpression;
var CJSRequireTransformer = require('./cjs').CJSRequireTransformer;
var Promise = require('bluebird');
function AMDDependenciesTransformer(map) {
  this.map = map;
  this.anonDefine = false;
  this.anonDefineIndex = -1;
  this.anonNamed = false;
  this.deps = [];
  this.bundleDefines = [];
  this.defineRedefined = false;
  return ParseTreeTransformer.call(this);
}
AMDDependenciesTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
AMDDependenciesTransformer.prototype.filterAMDDeps = function(deps) {
  var newDeps = [];
  var bundleDefines = this.bundleDefines;
  deps.forEach(function(dep) {
    if (['require', 'exports', 'module'].indexOf(dep) != -1)
      return;
    if (bundleDefines.indexOf(dep) != -1)
      return;
    newDeps.push(dep);
  });
  return newDeps;
};
AMDDependenciesTransformer.prototype.transformVariableDeclaration = function(tree) {
  if (tree.lvalue.identifierToken && tree.lvalue.identifierToken.value == 'define')
    this.defineRedefined = true;
  return tree;
};
AMDDependenciesTransformer.prototype.transformFunctionDeclaration = function(tree) {
  var defineRedefined = this.defineRedefined;
  tree = ParseTreeTransformer.prototype.transformFunctionDeclaration.call(this, tree);
  if (defineRedefined === false)
    this.defineRedefined = false;
  return tree;
};
AMDDependenciesTransformer.prototype.transformFunctionExpression = function(tree) {
  var defineRedefined = this.defineRedefined;
  tree = ParseTreeTransformer.prototype.transformFunctionExpression.call(this, tree);
  if (defineRedefined === false)
    this.defineRedefined = false;
  return tree;
};
AMDDependenciesTransformer.prototype.transformCallExpression = function(tree) {
  if (this.defineRedefined || !tree.operand.identifierToken || tree.operand.identifierToken.value != 'define')
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  var args = tree.args.args;
  var name;
  var depArg = -1;
  if (args[0].type == 'LITERAL_EXPRESSION' || args[1] && args[1].type == 'ARRAY_LITERAL') {
    name = args[0].literalToken && args[0].literalToken.processedValue || true;
    if (args[1] && args[1].type == 'ARRAY_LITERAL')
      depArg = 1;
  } else if (args[0].type == 'ARRAY_LITERAL') {
    depArg = 0;
  }
  var factoryArg = name && depArg == -1 ? 1 : depArg + 1;
  if (!args[factoryArg])
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  if (!this.anonDefine || this.anonNamed)
    this.anonDefineIndex++;
  var parseDeps = false;
  if (!name) {
    if (this.anonDefine && !this.anonNamed)
      throw new Error('Multiple anonymous defines.');
    this.anonDefine = true;
    this.anonNamed = false;
    parseDeps = true;
  } else {
    if (typeof name != 'boolean') {
      this.bundleDefines.push(name);
      var depsIndex = this.deps.indexOf(name);
      if (depsIndex != -1)
        this.deps.splice(depsIndex, 1);
    }
    if (!this.anonDefine && this.anonDefineIndex == 0 && typeof name != 'boolean') {
      this.anonDefine = true;
      this.anonNamed = true;
      parseDeps = true;
    } else if (this.anonDefine && this.anonNamed) {
      this.anonDefine = false;
      this.anonNamed = false;
      this.deps = [];
    }
  }
  if (!parseDeps)
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  if (depArg != -1) {
    var deps = args[depArg].elements.map(function(dep) {
      return dep.literalToken.processedValue;
    });
    var depMap = this.map;
    if (depMap)
      deps = deps.map(function(dep) {
        if (['require', 'exports', 'module'].indexOf(dep) != -1)
          return dep;
        return depMap(dep);
      });
    this.deps = this.filterAMDDeps(deps);
    args[depArg] = parseExpression([JSON.stringify(deps)]);
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  }
  if (depArg == -1 && args[factoryArg].type == 'FUNCTION_EXPRESSION') {
    var cjsFactory = args[factoryArg];
    var fnParameters = cjsFactory.parameterList.parameters;
    var reqName = fnParameters[0] && fnParameters[0].parameter.binding.identifierToken.value;
    var cjsRequires = new CJSRequireTransformer(reqName);
    cjsFactory.body = cjsRequires.transformAny(cjsFactory.body);
    this.deps = this.filterAMDDeps(cjsRequires.requires);
  }
  return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
};
exports.AMDDependenciesTransformer = AMDDependenciesTransformer;
function AMDDefineRegisterTransformer(moduleName, load, anonDefine, anonDefineIndex, depMap) {
  this.name = moduleName;
  this.load = load;
  this.anonDefine = anonDefine;
  this.anonDefineIndex = anonDefineIndex;
  this.curDefineIndex = -1;
  this.depMap = depMap;
  this.defineRedefined = false;
  return ParseTreeTransformer.call(this);
}
AMDDefineRegisterTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
AMDDefineRegisterTransformer.prototype.transformVariableDeclaration = AMDDependenciesTransformer.prototype.transformVariableDeclaration;
AMDDefineRegisterTransformer.prototype.transformFunctionDeclaration = AMDDependenciesTransformer.prototype.transformFunctionDeclaration;
AMDDefineRegisterTransformer.prototype.transformFunctionExpression = AMDDependenciesTransformer.prototype.transformFunctionExpression;
AMDDefineRegisterTransformer.prototype.transformCallExpression = function(tree) {
  if (this.defineRedefined || !tree.operand.identifierToken || tree.operand.identifierToken.value != 'define')
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  var self = this;
  var args = tree.args.args;
  var name;
  var depArg = -1;
  if (args[0].type == 'LITERAL_EXPRESSION' || args[1] && args[1].type == 'ARRAY_LITERAL') {
    name = args[0].literalToken && args[0].literalToken.processedValue || true;
    if (args[1] && args[1].type == 'ARRAY_LITERAL')
      depArg = 1;
  } else if (args[0].type == 'ARRAY_LITERAL') {
    depArg = 0;
  }
  var factoryArg = name && depArg == -1 ? 1 : depArg + 1;
  if (!args[factoryArg] || ++this.curDefineIndex != this.anonDefineIndex)
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
  var factoryTree = args[factoryArg];
  var deps = [];
  if (depArg != -1) {
    deps = args[depArg].elements.map(function(dep) {
      var depVal = dep.literalToken.processedValue;
      return self.depMap[depVal] || depVal;
    });
    deps = deps.concat(this.load.deps.map(function(dep) {
      return self.depMap[dep] || dep;
    }).filter(function(dep) {
      return deps.indexOf(dep) == -1;
    }));
  } else if (factoryTree.type == 'FUNCTION_EXPRESSION') {
    deps = ['require', 'exports', 'module'].splice(0, factoryTree.parameterList.parameters.length).concat(this.load.deps.map(function(dep) {
      return self.depMap[dep] || dep;
    }));
  }
  var requireIndex = deps.indexOf('require');
  if (requireIndex != -1 && factoryTree.type == 'FUNCTION_EXPRESSION') {
    var fnParameters = factoryTree.parameterList.parameters;
    var reqName = fnParameters[requireIndex] && fnParameters[requireIndex].parameter.binding.identifierToken.value;
    var cjsRequireTransformer = new CJSRequireTransformer(reqName, function(v) {
      return self.depMap[v] || v;
    });
    factoryTree.body = cjsRequireTransformer.transformAny(factoryTree.body);
  }
  var nameAlias = '';
  if (name && this.name && name != this.name)
    nameAlias = '&& define("' + name + '", ["' + this.name + '"], function(m) { return m; })';
  return parseExpression(['define(' + (this.name ? '"' + this.name + '", ' : '') + JSON.stringify(deps) + ', ', ')' + nameAlias + ';'], factoryTree);
};
exports.AMDDefineRegisterTransformer = AMDDefineRegisterTransformer;
function dedupe(deps) {
  var newDeps = [];
  for (var i = 0,
      l = deps.length; i < l; i++)
    if (newDeps.indexOf(deps[i]) == -1)
      newDeps.push(deps[i]);
  return newDeps;
}
function group(deps) {
  var names = [];
  var indices = [];
  for (var i = 0,
      l = deps.length; i < l; i++) {
    var index = names.indexOf(deps[i]);
    if (index === -1) {
      names.push(deps[i]);
      indices.push([i]);
    } else {
      indices[index].push(i);
    }
  }
  return {
    names: names,
    indices: indices
  };
}
exports.attach = function(loader) {
  var systemInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    return systemInstantiate.call(this, load).then(function(result) {
      if (load.metadata.format == 'amd') {
        if (!load.source)
          load.source = ' ';
        var compiler = new traceur.Compiler({
          script: true,
          sourceRoot: true
        });
        load.metadata.parseTree = compiler.parse(load.source, load.path);
        var depTransformer = new AMDDependenciesTransformer();
        depTransformer.transformAny(load.metadata.parseTree);
        load.metadata.anonDefine = depTransformer.anonDefine;
        load.metadata.anonDefineIndex = depTransformer.anonDefineIndex;
        var entry = loader.defined[load.name];
        entry.deps = dedupe(depTransformer.deps.concat(load.metadata.deps));
        load.metadata.builderExecute = function(require, exports, module) {
          var removeDefine = loader.get('@@amd-helpers').createDefine(loader);
          vm.runInThisContext(load.source);
          removeDefine(loader);
          var lastModule = loader.get('@@amd-helpers').lastModule;
          if (!lastModule.anonDefine && !lastModule.isBundle)
            throw new TypeError('AMD module ' + load.name + ' did not define');
          if (lastModule.anonDefine)
            return lastModule.anonDefine.execute.apply(this, arguments);
          lastModule.isBundle = false;
          lastModule.anonDefine = null;
        };
        var normalizePromises = [];
        for (var i = 0,
            l = entry.deps.length; i < l; i++)
          normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));
        return Promise.all(normalizePromises).then(function(normalizedDeps) {
          entry.normalizedDeps = normalizedDeps;
          entry.originalIndices = group(entry.deps);
          return {
            deps: entry.deps,
            execute: result.execute
          };
        });
      }
      return result;
    });
  };
};
exports.remap = function(source, map, fileName) {
  var options = {
    script: true,
    sourceRoot: true
  };
  var compiler = new traceur.Compiler(options);
  var tree = compiler.parse(source, fileName || '');
  var transformer = new AMDDependenciesTransformer(map);
  tree = transformer.transformAny(tree);
  var output = compiler.write(tree);
  return Promise.resolve(output);
};
exports.compile = function(load, opts, loader) {
  var normalize = opts.normalize;
  var options = {
    sourceRoot: true,
    script: true
  };
  if (opts.sourceMaps)
    options.sourceMaps = 'memory';
  if (opts.lowResSourceMaps)
    options.lowResolutionSourceMap = true;
  if (load.metadata.sourceMap)
    options.inputSourceMap = load.metadata.sourceMap;
  var compiler = new traceur.Compiler(options);
  var tree = load.metadata.parseTree || compiler.parse(load.source, load.path);
  var transformer = new AMDDefineRegisterTransformer(!opts.anonymous && load.name, load, load.metadata.anonDefine, load.metadata.anonDefineIndex, normalize ? load.depMap : {});
  tree = transformer.transformAny(tree);
  var output = compiler.write(tree, load.path);
  return Promise.resolve({
    source: '(function() {\nvar define = ' + opts.systemGlobal + '.amdDefine;\n' + output + '\n})();',
    sourceMap: compiler.getSourceMap(),
    sourceMapOffset: 2
  });
};
exports.sfx = function(loader) {
  return require('fs').readFileSync(require('path').resolve(__dirname, '../templates/amd-helpers.min.js')).toString();
};
