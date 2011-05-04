// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var vm   = require('vm'),
    fs   = require('fs'),
    path = require('path'),
    util = require('util');

var traceur = (function() {
    'use strict';

    /**
    * Builds an object structure for the provided namespace path,
    * ensuring that names that already exist are not overwritten. For
    * example:
    * "a.b.c" -> a = {};a.b={};a.b.c={};
    * @param {string} name Name of the object that this file defines.
    * @private
    */
    var context = {};
    context.traceur = {};

    context.traceur.exportPath = function(name) {
      var parts = name.split('.');
      var cur = context.traceur;

      for (var part; parts.length && (part = parts.shift());) {
        if (part in cur) {
          cur = cur[part];
        } else {
          cur = cur[part] = {};
        }
      }
      return cur;
    };

    /**
    * @param {string} name
    * @param {!Function} fun
    */
    context.traceur.define = function(name, fun) {
      var obj = context.traceur.exportPath(name);
      var exports = fun();
      for (var propertyName in exports) {
        // Maybe we should check the prototype chain here? The current usage
        // pattern is always using an object literal so we only care about own
        // properties.
        var propertyDescriptor = Object.getOwnPropertyDescriptor(exports,
          propertyName);
        if (propertyDescriptor)
          Object.defineProperty(obj, propertyName, propertyDescriptor);
      }
    };

    context.traceur.assert = function(b) {
      if (!b)
        throw Error('Assertion failed');
    };

    // Cached path to the current script file in an HTML hosting environment.

    // Use comma expression to use global eval.
    //var context = ('global', eval)('this');

    // Allow script before this one to define a global importScript function.
    var importScript = global.importScript || function(file) {
      var code = fs.readFileSync(path.join(__dirname, file), 'utf8');
      var script = vm.createScript(code);
      script.runInNewContext(context);
    };

    context.traceur.uidCounter = 0;

    /**
    * Returns a new unique ID.
    * @return {number}
    */
    context.traceur.getUid = function() {
      return ++context.traceur.uidCounter;
    };

    var scripts = [
      'util/ObjectMap.js',
      'util/SourceRange.js',
      'util/SourcePosition.js',
      'syntax/Token.js',
      'syntax/TokenType.js',
      'syntax/LiteralToken.js',
      'syntax/IdentifierToken.js',
      'syntax/Keywords.js',
      'syntax/LineNumberTable.js',
      'syntax/SourceFile.js',
      'syntax/Scanner.js',
      'syntax/PredefinedName.js',
      'syntax/trees/ParseTreeType.js',
      'syntax/trees/ParseTree.js',
      'syntax/trees/NullTree.js',
      'syntax/trees/ParseTrees.js',
      'util/ErrorReporter.js',
      'util/MutedErrorReporter.js',
      'syntax/Parser.js',
      'syntax/ParseTreeVisitor.js',
      'util/StringBuilder.js',
      'semantics/VariableBinder.js',
      'semantics/symbols/SymbolType.js',
      'semantics/symbols/Symbol.js',
      'semantics/symbols/MemberSymbol.js',
      'semantics/symbols/MethodSymbol.js',
      'semantics/symbols/ModuleSymbol.js',
      'semantics/symbols/ExportSymbol.js',
      'semantics/symbols/FieldSymbol.js',
      'semantics/symbols/PropertyAccessor.js',
      'semantics/symbols/GetAccessor.js',
      'semantics/symbols/SetAccessor.js',
      'semantics/symbols/PropertySymbol.js',
      'semantics/symbols/AggregateSymbol.js',
      'semantics/symbols/ClassSymbol.js',
      'semantics/symbols/Project.js',
      'semantics/symbols/TraitSymbol.js',
      'semantics/symbols/RequiresSymbol.js',
      'semantics/ClassAnalyzer.js',
      'codegeneration/ParseTreeWriter.js',
      'syntax/ParseTreeValidator.js',
      'codegeneration/ParseTreeFactory.js',
      'codegeneration/ParseTreeTransformer.js',
      'codegeneration/AlphaRenamer.js',
      'codegeneration/DestructuringTransformer.js',
      'codegeneration/DefaultParametersTransformer.js',
      'codegeneration/RestParameterTransformer.js',
      'codegeneration/SpreadTransformer.js',
      'codegeneration/UniqueIdentifierGenerator.js',
      'codegeneration/ForEachTransformer.js',
      'codegeneration/ModuleTransformer.js',
      'codegeneration/FunctionTransformer.js',
      'codegeneration/ClassTransformer.js',
      'codegeneration/BlockBindingTransformer.js',
      'codegeneration/generator/ForInTransformPass.js',
      'codegeneration/generator/State.js',
      'codegeneration/generator/FallThroughState.js',
      'codegeneration/generator/TryState.js',
      'codegeneration/generator/BreakState.js',
      'codegeneration/generator/CatchState.js',
      'codegeneration/generator/ConditionalState.js',
      'codegeneration/generator/ContinueState.js',
      'codegeneration/generator/EndState.js',
      'codegeneration/generator/FinallyFallThroughState.js',
      'codegeneration/generator/FinallyState.js',
      'codegeneration/generator/SwitchState.js',
      'codegeneration/generator/YieldState.js',
      'codegeneration/generator/StateAllocator.js',
      'syntax/trees/StateMachine.js',
      'codegeneration/generator/BreakContinueTransformer.js',
      'codegeneration/generator/CPSTransformer.js',
      'codegeneration/generator/GeneratorTransformer.js',
      'codegeneration/generator/AsyncTransformer.js',
      'codegeneration/GeneratorTransformPass.js',
      'semantics/FreeVariableChecker.js',
      'codegeneration/ProgramTransformer.js',
      'codegeneration/ProjectWriter.js',
      'codegeneration/module/ModuleVisitor.js',
      'codegeneration/module/ModuleDefinitionVisitor.js',
      'codegeneration/module/ExportVisitor.js',
      'codegeneration/module/ModuleDeclarationVisitor.js',
      'codegeneration/module/ValidationVisitor.js',
      'semantics/ModuleAnalyzer.js',
      'codegeneration/Compiler.js',
      'runtime.js',
      'util/traits.js'
    ];

     scripts.forEach(importScript);

    return context.traceur;
})();

module.exports = traceur;
