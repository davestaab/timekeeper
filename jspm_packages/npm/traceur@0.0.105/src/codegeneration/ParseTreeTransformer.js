/* */ 
"format cjs";
// Copyright 2013 Traceur Authors.
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

// This file was auto generated by build-parse-tree-transformer.js
// from trees.json
// Do not edit!

import {
  Annotation,
  AnonBlock,
  ArgumentList,
  ArrayComprehension,
  ArrayLiteral,
  ArrayPattern,
  ArrayType,
  ArrowFunction,
  AssignmentElement,
  AwaitExpression,
  BinaryExpression,
  BindingElement,
  BindingIdentifier,
  Block,
  BreakStatement,
  CallExpression,
  CallSignature,
  CaseClause,
  Catch,
  ClassDeclaration,
  ClassExpression,
  CommaExpression,
  ComprehensionFor,
  ComprehensionIf,
  ComputedPropertyName,
  ConditionalExpression,
  ConstructSignature,
  ConstructorType,
  ContinueStatement,
  CoverFormals,
  CoverInitializedName,
  DebuggerStatement,
  DefaultClause,
  DoWhileStatement,
  EmptyStatement,
  ExportDeclaration,
  ExportDefault,
  ExportSpecifier,
  ExportSpecifierSet,
  ExportStar,
  ExpressionStatement,
  Finally,
  ForInStatement,
  ForOfStatement,
  ForOnStatement,
  ForStatement,
  FormalParameter,
  FormalParameterList,
  ForwardDefaultExport,
  FunctionBody,
  FunctionDeclaration,
  FunctionExpression,
  FunctionType,
  GeneratorComprehension,
  GetAccessor,
  IdentifierExpression,
  IfStatement,
  ImportedBinding,
  ImportClausePair,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  ImportTypeClause,
  IndexSignature,
  InterfaceDeclaration,
  JsxAttribute,
  JsxElement,
  JsxElementName,
  JsxPlaceholder,
  JsxSpreadAttribute,
  JsxText,
  LabelledStatement,
  LiteralExpression,
  LiteralPropertyName,
  MemberExpression,
  MemberLookupExpression,
  Method,
  MethodSignature,
  Module,
  ModuleSpecifier,
  NameSpaceExport,
  NameSpaceImport,
  NamedExport,
  NewExpression,
  ObjectLiteral,
  ObjectPattern,
  ObjectPatternField,
  ObjectType,
  ParenExpression,
  PostfixExpression,
  PredefinedType,
  Script,
  PropertyNameAssignment,
  PropertyNameShorthand,
  PropertyVariableDeclaration,
  PropertySignature,
  RestParameter,
  ReturnStatement,
  SetAccessor,
  SpreadExpression,
  SpreadPatternElement,
  SuperExpression,
  SwitchStatement,
  SyntaxErrorTree,
  TemplateLiteralExpression,
  TemplateLiteralPortion,
  TemplateSubstitution,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TypeAliasDeclaration,
  TypeArguments,
  TypeName,
  TypeParameter,
  TypeParameters,
  TypeReference,
  UnaryExpression,
  UnionType,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  WhileStatement,
  WithStatement,
  YieldExpression,
} from '../syntax/trees/ParseTrees.js';
export class ParseTreeTransformer {
  transformAny(tree) {
    return tree === null ? null : tree.transform(this);
  }
  transformList(list) {
    let builder = null;
    for (let index = 0; index < list.length; index++) {
      let element = list[index];
      let transformed = this.transformAny(element);
      if (builder != null || element != transformed) {
        if (builder === null) {
          builder = list.slice(0, index);
        }
        if (transformed instanceof AnonBlock)
          builder.push(...transformed.statements);
        else
          builder.push(transformed);
      }
    }
    return builder || list;
  }
  transformStateMachine(tree) {
    throw Error('State machines should not live outside of the GeneratorTransformer.');
  }
  transformToBlockOrStatement(tree) {
    let transformed = this.transformAny(tree);
    if (transformed instanceof AnonBlock) {
      return new Block(transformed.location, transformed.statements);
    }
    return transformed;
  }

  transformAnnotation(tree) {
    let name = this.transformAny(tree.name);
    let args = this.transformAny(tree.args);
    if (name === tree.name && args === tree.args) {
      return tree;
    }
    return new Annotation(tree.location, name, args);
  }
  transformAnonBlock(tree) {
    let statements = this.transformList(tree.statements);
    if (statements === tree.statements) {
      return tree;
    }
    return new AnonBlock(tree.location, statements);
  }
  transformArgumentList(tree) {
    let args = this.transformList(tree.args);
    if (args === tree.args) {
      return tree;
    }
    return new ArgumentList(tree.location, args);
  }
  transformArrayComprehension(tree) {
    let comprehensionList = this.transformList(tree.comprehensionList);
    let expression = this.transformAny(tree.expression);
    if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
      return tree;
    }
    return new ArrayComprehension(tree.location, comprehensionList, expression);
  }
  transformArrayLiteral(tree) {
    let elements = this.transformList(tree.elements);
    if (elements === tree.elements) {
      return tree;
    }
    return new ArrayLiteral(tree.location, elements);
  }
  transformArrayPattern(tree) {
    let elements = this.transformList(tree.elements);
    if (elements === tree.elements) {
      return tree;
    }
    return new ArrayPattern(tree.location, elements);
  }
  transformArrayType(tree) {
    let elementType = this.transformAny(tree.elementType);
    if (elementType === tree.elementType) {
      return tree;
    }
    return new ArrayType(tree.location, elementType);
  }
  transformArrowFunction(tree) {
    let parameterList = this.transformAny(tree.parameterList);
    let body = this.transformAny(tree.body);
    if (parameterList === tree.parameterList && body === tree.body) {
      return tree;
    }
    return new ArrowFunction(tree.location, tree.functionKind, parameterList, body);
  }
  transformAssignmentElement(tree) {
    let assignment = this.transformAny(tree.assignment);
    let initializer = this.transformAny(tree.initializer);
    if (assignment === tree.assignment && initializer === tree.initializer) {
      return tree;
    }
    return new AssignmentElement(tree.location, assignment, initializer);
  }
  transformAwaitExpression(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new AwaitExpression(tree.location, expression);
  }
  transformBinaryExpression(tree) {
    let left = this.transformAny(tree.left);
    let right = this.transformAny(tree.right);
    if (left === tree.left && right === tree.right) {
      return tree;
    }
    return new BinaryExpression(tree.location, left, tree.operator, right);
  }
  transformBindingElement(tree) {
    let binding = this.transformAny(tree.binding);
    let initializer = this.transformAny(tree.initializer);
    if (binding === tree.binding && initializer === tree.initializer) {
      return tree;
    }
    return new BindingElement(tree.location, binding, initializer);
  }
  transformBindingIdentifier(tree) {
    return tree;
  }
  transformBlock(tree) {
    let statements = this.transformList(tree.statements);
    if (statements === tree.statements) {
      return tree;
    }
    return new Block(tree.location, statements);
  }
  transformBreakStatement(tree) {
    return tree;
  }
  transformCallExpression(tree) {
    let operand = this.transformAny(tree.operand);
    let args = this.transformAny(tree.args);
    if (operand === tree.operand && args === tree.args) {
      return tree;
    }
    return new CallExpression(tree.location, operand, args);
  }
  transformCallSignature(tree) {
    let typeParameters = this.transformAny(tree.typeParameters);
    let parameterList = this.transformAny(tree.parameterList);
    let returnType = this.transformAny(tree.returnType);
    if (typeParameters === tree.typeParameters && parameterList === tree.parameterList && returnType === tree.returnType) {
      return tree;
    }
    return new CallSignature(tree.location, typeParameters, parameterList, returnType);
  }
  transformCaseClause(tree) {
    let expression = this.transformAny(tree.expression);
    let statements = this.transformList(tree.statements);
    if (expression === tree.expression && statements === tree.statements) {
      return tree;
    }
    return new CaseClause(tree.location, expression, statements);
  }
  transformCatch(tree) {
    let binding = this.transformAny(tree.binding);
    let catchBody = this.transformAny(tree.catchBody);
    if (binding === tree.binding && catchBody === tree.catchBody) {
      return tree;
    }
    return new Catch(tree.location, binding, catchBody);
  }
  transformClassDeclaration(tree) {
    let name = this.transformAny(tree.name);
    let superClass = this.transformAny(tree.superClass);
    let elements = this.transformList(tree.elements);
    let annotations = this.transformList(tree.annotations);
    let typeParameters = this.transformAny(tree.typeParameters);
    if (name === tree.name && superClass === tree.superClass && elements === tree.elements && annotations === tree.annotations && typeParameters === tree.typeParameters) {
      return tree;
    }
    return new ClassDeclaration(tree.location, name, superClass, elements, annotations, typeParameters);
  }
  transformClassExpression(tree) {
    let name = this.transformAny(tree.name);
    let superClass = this.transformAny(tree.superClass);
    let elements = this.transformList(tree.elements);
    let annotations = this.transformList(tree.annotations);
    let typeParameters = this.transformAny(tree.typeParameters);
    if (name === tree.name && superClass === tree.superClass && elements === tree.elements && annotations === tree.annotations && typeParameters === tree.typeParameters) {
      return tree;
    }
    return new ClassExpression(tree.location, name, superClass, elements, annotations, typeParameters);
  }
  transformCommaExpression(tree) {
    let expressions = this.transformList(tree.expressions);
    if (expressions === tree.expressions) {
      return tree;
    }
    return new CommaExpression(tree.location, expressions);
  }
  transformComprehensionFor(tree) {
    let left = this.transformAny(tree.left);
    let iterator = this.transformAny(tree.iterator);
    if (left === tree.left && iterator === tree.iterator) {
      return tree;
    }
    return new ComprehensionFor(tree.location, left, iterator);
  }
  transformComprehensionIf(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ComprehensionIf(tree.location, expression);
  }
  transformComputedPropertyName(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ComputedPropertyName(tree.location, expression);
  }
  transformConditionalExpression(tree) {
    let condition = this.transformAny(tree.condition);
    let left = this.transformAny(tree.left);
    let right = this.transformAny(tree.right);
    if (condition === tree.condition && left === tree.left && right === tree.right) {
      return tree;
    }
    return new ConditionalExpression(tree.location, condition, left, right);
  }
  transformConstructSignature(tree) {
    let typeParameters = this.transformAny(tree.typeParameters);
    let parameterList = this.transformAny(tree.parameterList);
    let returnType = this.transformAny(tree.returnType);
    if (typeParameters === tree.typeParameters && parameterList === tree.parameterList && returnType === tree.returnType) {
      return tree;
    }
    return new ConstructSignature(tree.location, typeParameters, parameterList, returnType);
  }
  transformConstructorType(tree) {
    let typeParameters = this.transformAny(tree.typeParameters);
    let parameterList = this.transformAny(tree.parameterList);
    let returnType = this.transformAny(tree.returnType);
    if (typeParameters === tree.typeParameters && parameterList === tree.parameterList && returnType === tree.returnType) {
      return tree;
    }
    return new ConstructorType(tree.location, typeParameters, parameterList, returnType);
  }
  transformContinueStatement(tree) {
    return tree;
  }
  transformCoverFormals(tree) {
    let expressions = this.transformList(tree.expressions);
    if (expressions === tree.expressions) {
      return tree;
    }
    return new CoverFormals(tree.location, expressions);
  }
  transformCoverInitializedName(tree) {
    let initializer = this.transformAny(tree.initializer);
    if (initializer === tree.initializer) {
      return tree;
    }
    return new CoverInitializedName(tree.location, tree.name, tree.equalToken, initializer);
  }
  transformDebuggerStatement(tree) {
    return tree;
  }
  transformDefaultClause(tree) {
    let statements = this.transformList(tree.statements);
    if (statements === tree.statements) {
      return tree;
    }
    return new DefaultClause(tree.location, statements);
  }
  transformDoWhileStatement(tree) {
    let body = this.transformToBlockOrStatement(tree.body);
    let condition = this.transformAny(tree.condition);
    if (body === tree.body && condition === tree.condition) {
      return tree;
    }
    return new DoWhileStatement(tree.location, body, condition);
  }
  transformEmptyStatement(tree) {
    return tree;
  }
  transformExportDeclaration(tree) {
    let declaration = this.transformAny(tree.declaration);
    let annotations = this.transformList(tree.annotations);
    if (declaration === tree.declaration && annotations === tree.annotations) {
      return tree;
    }
    return new ExportDeclaration(tree.location, declaration, annotations);
  }
  transformExportDefault(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ExportDefault(tree.location, expression);
  }
  transformExportSpecifier(tree) {
    return tree;
  }
  transformExportSpecifierSet(tree) {
    let specifiers = this.transformList(tree.specifiers);
    if (specifiers === tree.specifiers) {
      return tree;
    }
    return new ExportSpecifierSet(tree.location, specifiers);
  }
  transformExportStar(tree) {
    return tree;
  }
  transformExpressionStatement(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ExpressionStatement(tree.location, expression);
  }
  transformFinally(tree) {
    let block = this.transformAny(tree.block);
    if (block === tree.block) {
      return tree;
    }
    return new Finally(tree.location, block);
  }
  transformForInStatement(tree) {
    let initializer = this.transformAny(tree.initializer);
    let collection = this.transformAny(tree.collection);
    let body = this.transformToBlockOrStatement(tree.body);
    if (initializer === tree.initializer && collection === tree.collection && body === tree.body) {
      return tree;
    }
    return new ForInStatement(tree.location, initializer, collection, body);
  }
  transformForOfStatement(tree) {
    let initializer = this.transformAny(tree.initializer);
    let collection = this.transformAny(tree.collection);
    let body = this.transformToBlockOrStatement(tree.body);
    if (initializer === tree.initializer && collection === tree.collection && body === tree.body) {
      return tree;
    }
    return new ForOfStatement(tree.location, initializer, collection, body);
  }
  transformForOnStatement(tree) {
    let initializer = this.transformAny(tree.initializer);
    let observable = this.transformAny(tree.observable);
    let body = this.transformToBlockOrStatement(tree.body);
    if (initializer === tree.initializer && observable === tree.observable && body === tree.body) {
      return tree;
    }
    return new ForOnStatement(tree.location, initializer, observable, body);
  }
  transformForStatement(tree) {
    let initializer = this.transformAny(tree.initializer);
    let condition = this.transformAny(tree.condition);
    let increment = this.transformAny(tree.increment);
    let body = this.transformToBlockOrStatement(tree.body);
    if (initializer === tree.initializer && condition === tree.condition && increment === tree.increment && body === tree.body) {
      return tree;
    }
    return new ForStatement(tree.location, initializer, condition, increment, body);
  }
  transformFormalParameter(tree) {
    let parameter = this.transformAny(tree.parameter);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    if (parameter === tree.parameter && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations) {
      return tree;
    }
    return new FormalParameter(tree.location, parameter, typeAnnotation, annotations);
  }
  transformFormalParameterList(tree) {
    let parameters = this.transformList(tree.parameters);
    if (parameters === tree.parameters) {
      return tree;
    }
    return new FormalParameterList(tree.location, parameters);
  }
  transformForwardDefaultExport(tree) {
    return tree;
  }
  transformFunctionBody(tree) {
    let statements = this.transformList(tree.statements);
    if (statements === tree.statements) {
      return tree;
    }
    return new FunctionBody(tree.location, statements);
  }
  transformFunctionDeclaration(tree) {
    let name = this.transformAny(tree.name);
    let parameterList = this.transformAny(tree.parameterList);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    let body = this.transformAny(tree.body);
    if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && body === tree.body) {
      return tree;
    }
    return new FunctionDeclaration(tree.location, name, tree.functionKind, parameterList, typeAnnotation, annotations, body);
  }
  transformFunctionExpression(tree) {
    let name = this.transformAny(tree.name);
    let parameterList = this.transformAny(tree.parameterList);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    let body = this.transformAny(tree.body);
    if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && body === tree.body) {
      return tree;
    }
    return new FunctionExpression(tree.location, name, tree.functionKind, parameterList, typeAnnotation, annotations, body);
  }
  transformFunctionType(tree) {
    let typeParameters = this.transformAny(tree.typeParameters);
    let parameterList = this.transformAny(tree.parameterList);
    let returnType = this.transformAny(tree.returnType);
    if (typeParameters === tree.typeParameters && parameterList === tree.parameterList && returnType === tree.returnType) {
      return tree;
    }
    return new FunctionType(tree.location, typeParameters, parameterList, returnType);
  }
  transformGeneratorComprehension(tree) {
    let comprehensionList = this.transformList(tree.comprehensionList);
    let expression = this.transformAny(tree.expression);
    if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
      return tree;
    }
    return new GeneratorComprehension(tree.location, comprehensionList, expression);
  }
  transformGetAccessor(tree) {
    let name = this.transformAny(tree.name);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    let body = this.transformAny(tree.body);
    if (name === tree.name && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && body === tree.body) {
      return tree;
    }
    return new GetAccessor(tree.location, tree.isStatic, name, typeAnnotation, annotations, body);
  }
  transformIdentifierExpression(tree) {
    return tree;
  }
  transformIfStatement(tree) {
    let condition = this.transformAny(tree.condition);
    let ifClause = this.transformToBlockOrStatement(tree.ifClause);
    let elseClause = this.transformToBlockOrStatement(tree.elseClause);
    if (condition === tree.condition && ifClause === tree.ifClause && elseClause === tree.elseClause) {
      return tree;
    }
    return new IfStatement(tree.location, condition, ifClause, elseClause);
  }
  transformImportedBinding(tree) {
    let binding = this.transformAny(tree.binding);
    if (binding === tree.binding) {
      return tree;
    }
    return new ImportedBinding(tree.location, binding);
  }
  transformImportClausePair(tree) {
    let first = this.transformAny(tree.first);
    let second = this.transformAny(tree.second);
    if (first === tree.first && second === tree.second) {
      return tree;
    }
    return new ImportClausePair(tree.location, first, second);
  }
  transformImportDeclaration(tree) {
    let importClause = this.transformAny(tree.importClause);
    let moduleSpecifier = this.transformAny(tree.moduleSpecifier);
    if (importClause === tree.importClause && moduleSpecifier === tree.moduleSpecifier) {
      return tree;
    }
    return new ImportDeclaration(tree.location, importClause, moduleSpecifier);
  }
  transformImportSpecifier(tree) {
    let binding = this.transformAny(tree.binding);
    if (binding === tree.binding) {
      return tree;
    }
    return new ImportSpecifier(tree.location, binding, tree.name);
  }
  transformImportSpecifierSet(tree) {
    let specifiers = this.transformList(tree.specifiers);
    if (specifiers === tree.specifiers) {
      return tree;
    }
    return new ImportSpecifierSet(tree.location, specifiers);
  }
  transformImportTypeClause(tree) {
    let clause = this.transformAny(tree.clause);
    if (clause === tree.clause) {
      return tree;
    }
    return new ImportTypeClause(tree.location, clause);
  }
  transformIndexSignature(tree) {
    let indexType = this.transformAny(tree.indexType);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    if (indexType === tree.indexType && typeAnnotation === tree.typeAnnotation) {
      return tree;
    }
    return new IndexSignature(tree.location, tree.name, indexType, typeAnnotation);
  }
  transformInterfaceDeclaration(tree) {
    let typeParameters = this.transformAny(tree.typeParameters);
    let objectType = this.transformAny(tree.objectType);
    if (typeParameters === tree.typeParameters && objectType === tree.objectType) {
      return tree;
    }
    return new InterfaceDeclaration(tree.location, tree.name, typeParameters, tree.extendsClause, objectType);
  }
  transformJsxAttribute(tree) {
    let value = this.transformAny(tree.value);
    if (value === tree.value) {
      return tree;
    }
    return new JsxAttribute(tree.location, tree.name, value);
  }
  transformJsxElement(tree) {
    let name = this.transformAny(tree.name);
    let attributes = this.transformList(tree.attributes);
    let children = this.transformList(tree.children);
    if (name === tree.name && attributes === tree.attributes && children === tree.children) {
      return tree;
    }
    return new JsxElement(tree.location, name, attributes, children);
  }
  transformJsxElementName(tree) {
    return tree;
  }
  transformJsxPlaceholder(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new JsxPlaceholder(tree.location, expression);
  }
  transformJsxSpreadAttribute(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new JsxSpreadAttribute(tree.location, expression);
  }
  transformJsxText(tree) {
    return tree;
  }
  transformLabelledStatement(tree) {
    let statement = this.transformAny(tree.statement);
    if (statement === tree.statement) {
      return tree;
    }
    return new LabelledStatement(tree.location, tree.name, statement);
  }
  transformLiteralExpression(tree) {
    return tree;
  }
  transformLiteralPropertyName(tree) {
    return tree;
  }
  transformMemberExpression(tree) {
    let operand = this.transformAny(tree.operand);
    if (operand === tree.operand) {
      return tree;
    }
    return new MemberExpression(tree.location, operand, tree.memberName);
  }
  transformMemberLookupExpression(tree) {
    let operand = this.transformAny(tree.operand);
    let memberExpression = this.transformAny(tree.memberExpression);
    if (operand === tree.operand && memberExpression === tree.memberExpression) {
      return tree;
    }
    return new MemberLookupExpression(tree.location, operand, memberExpression);
  }
  transformMethod(tree) {
    let name = this.transformAny(tree.name);
    let parameterList = this.transformAny(tree.parameterList);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    let body = this.transformAny(tree.body);
    let debugName = this.transformAny(tree.debugName);
    if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && body === tree.body && debugName === tree.debugName) {
      return tree;
    }
    return new Method(tree.location, tree.isStatic, tree.functionKind, name, parameterList, typeAnnotation, annotations, body, debugName);
  }
  transformMethodSignature(tree) {
    let name = this.transformAny(tree.name);
    let callSignature = this.transformAny(tree.callSignature);
    if (name === tree.name && callSignature === tree.callSignature) {
      return tree;
    }
    return new MethodSignature(tree.location, name, tree.optional, callSignature);
  }
  transformModule(tree) {
    let scriptItemList = this.transformList(tree.scriptItemList);
    if (scriptItemList === tree.scriptItemList) {
      return tree;
    }
    return new Module(tree.location, scriptItemList, tree.moduleName);
  }
  transformModuleSpecifier(tree) {
    return tree;
  }
  transformNameSpaceExport(tree) {
    return tree;
  }
  transformNameSpaceImport(tree) {
    let binding = this.transformAny(tree.binding);
    if (binding === tree.binding) {
      return tree;
    }
    return new NameSpaceImport(tree.location, binding);
  }
  transformNamedExport(tree) {
    let exportClause = this.transformAny(tree.exportClause);
    let moduleSpecifier = this.transformAny(tree.moduleSpecifier);
    if (exportClause === tree.exportClause && moduleSpecifier === tree.moduleSpecifier) {
      return tree;
    }
    return new NamedExport(tree.location, exportClause, moduleSpecifier);
  }
  transformNewExpression(tree) {
    let operand = this.transformAny(tree.operand);
    let args = this.transformAny(tree.args);
    if (operand === tree.operand && args === tree.args) {
      return tree;
    }
    return new NewExpression(tree.location, operand, args);
  }
  transformObjectLiteral(tree) {
    let propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
    if (propertyNameAndValues === tree.propertyNameAndValues) {
      return tree;
    }
    return new ObjectLiteral(tree.location, propertyNameAndValues);
  }
  transformObjectPattern(tree) {
    let fields = this.transformList(tree.fields);
    if (fields === tree.fields) {
      return tree;
    }
    return new ObjectPattern(tree.location, fields);
  }
  transformObjectPatternField(tree) {
    let name = this.transformAny(tree.name);
    let element = this.transformAny(tree.element);
    if (name === tree.name && element === tree.element) {
      return tree;
    }
    return new ObjectPatternField(tree.location, name, element);
  }
  transformObjectType(tree) {
    let typeMembers = this.transformList(tree.typeMembers);
    if (typeMembers === tree.typeMembers) {
      return tree;
    }
    return new ObjectType(tree.location, typeMembers);
  }
  transformParenExpression(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ParenExpression(tree.location, expression);
  }
  transformPostfixExpression(tree) {
    let operand = this.transformAny(tree.operand);
    if (operand === tree.operand) {
      return tree;
    }
    return new PostfixExpression(tree.location, operand, tree.operator);
  }
  transformPredefinedType(tree) {
    return tree;
  }
  transformScript(tree) {
    let scriptItemList = this.transformList(tree.scriptItemList);
    if (scriptItemList === tree.scriptItemList) {
      return tree;
    }
    return new Script(tree.location, scriptItemList, tree.moduleName);
  }
  transformPropertyNameAssignment(tree) {
    let name = this.transformAny(tree.name);
    let value = this.transformAny(tree.value);
    if (name === tree.name && value === tree.value) {
      return tree;
    }
    return new PropertyNameAssignment(tree.location, name, value);
  }
  transformPropertyNameShorthand(tree) {
    return tree;
  }
  transformPropertyVariableDeclaration(tree) {
    let name = this.transformAny(tree.name);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let annotations = this.transformList(tree.annotations);
    let initializer = this.transformAny(tree.initializer);
    if (name === tree.name && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && initializer === tree.initializer) {
      return tree;
    }
    return new PropertyVariableDeclaration(tree.location, tree.isStatic, name, typeAnnotation, annotations, initializer);
  }
  transformPropertySignature(tree) {
    let name = this.transformAny(tree.name);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    if (name === tree.name && typeAnnotation === tree.typeAnnotation) {
      return tree;
    }
    return new PropertySignature(tree.location, name, tree.optional, typeAnnotation);
  }
  transformRestParameter(tree) {
    let identifier = this.transformAny(tree.identifier);
    if (identifier === tree.identifier) {
      return tree;
    }
    return new RestParameter(tree.location, identifier);
  }
  transformReturnStatement(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new ReturnStatement(tree.location, expression);
  }
  transformSetAccessor(tree) {
    let name = this.transformAny(tree.name);
    let parameterList = this.transformAny(tree.parameterList);
    let annotations = this.transformList(tree.annotations);
    let body = this.transformAny(tree.body);
    if (name === tree.name && parameterList === tree.parameterList && annotations === tree.annotations && body === tree.body) {
      return tree;
    }
    return new SetAccessor(tree.location, tree.isStatic, name, parameterList, annotations, body);
  }
  transformSpreadExpression(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new SpreadExpression(tree.location, expression);
  }
  transformSpreadPatternElement(tree) {
    let lvalue = this.transformAny(tree.lvalue);
    if (lvalue === tree.lvalue) {
      return tree;
    }
    return new SpreadPatternElement(tree.location, lvalue);
  }
  transformSuperExpression(tree) {
    return tree;
  }
  transformSwitchStatement(tree) {
    let expression = this.transformAny(tree.expression);
    let caseClauses = this.transformList(tree.caseClauses);
    if (expression === tree.expression && caseClauses === tree.caseClauses) {
      return tree;
    }
    return new SwitchStatement(tree.location, expression, caseClauses);
  }
  transformSyntaxErrorTree(tree) {
    return tree;
  }
  transformTemplateLiteralExpression(tree) {
    let operand = this.transformAny(tree.operand);
    let elements = this.transformList(tree.elements);
    if (operand === tree.operand && elements === tree.elements) {
      return tree;
    }
    return new TemplateLiteralExpression(tree.location, operand, elements);
  }
  transformTemplateLiteralPortion(tree) {
    return tree;
  }
  transformTemplateSubstitution(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new TemplateSubstitution(tree.location, expression);
  }
  transformThisExpression(tree) {
    return tree;
  }
  transformThrowStatement(tree) {
    let value = this.transformAny(tree.value);
    if (value === tree.value) {
      return tree;
    }
    return new ThrowStatement(tree.location, value);
  }
  transformTryStatement(tree) {
    let body = this.transformAny(tree.body);
    let catchBlock = this.transformAny(tree.catchBlock);
    let finallyBlock = this.transformAny(tree.finallyBlock);
    if (body === tree.body && catchBlock === tree.catchBlock && finallyBlock === tree.finallyBlock) {
      return tree;
    }
    return new TryStatement(tree.location, body, catchBlock, finallyBlock);
  }
  transformTypeAliasDeclaration(tree) {
    let value = this.transformAny(tree.value);
    if (value === tree.value) {
      return tree;
    }
    return new TypeAliasDeclaration(tree.location, tree.name, value);
  }
  transformTypeArguments(tree) {
    let args = this.transformList(tree.args);
    if (args === tree.args) {
      return tree;
    }
    return new TypeArguments(tree.location, args);
  }
  transformTypeName(tree) {
    let moduleName = this.transformAny(tree.moduleName);
    if (moduleName === tree.moduleName) {
      return tree;
    }
    return new TypeName(tree.location, moduleName, tree.name);
  }
  transformTypeParameter(tree) {
    let extendsType = this.transformAny(tree.extendsType);
    if (extendsType === tree.extendsType) {
      return tree;
    }
    return new TypeParameter(tree.location, tree.identifierToken, extendsType);
  }
  transformTypeParameters(tree) {
    let parameters = this.transformList(tree.parameters);
    if (parameters === tree.parameters) {
      return tree;
    }
    return new TypeParameters(tree.location, parameters);
  }
  transformTypeReference(tree) {
    let typeName = this.transformAny(tree.typeName);
    let args = this.transformAny(tree.args);
    if (typeName === tree.typeName && args === tree.args) {
      return tree;
    }
    return new TypeReference(tree.location, typeName, args);
  }
  transformUnaryExpression(tree) {
    let operand = this.transformAny(tree.operand);
    if (operand === tree.operand) {
      return tree;
    }
    return new UnaryExpression(tree.location, tree.operator, operand);
  }
  transformUnionType(tree) {
    let types = this.transformList(tree.types);
    if (types === tree.types) {
      return tree;
    }
    return new UnionType(tree.location, types);
  }
  transformVariableDeclaration(tree) {
    let lvalue = this.transformAny(tree.lvalue);
    let typeAnnotation = this.transformAny(tree.typeAnnotation);
    let initializer = this.transformAny(tree.initializer);
    if (lvalue === tree.lvalue && typeAnnotation === tree.typeAnnotation && initializer === tree.initializer) {
      return tree;
    }
    return new VariableDeclaration(tree.location, lvalue, typeAnnotation, initializer);
  }
  transformVariableDeclarationList(tree) {
    let declarations = this.transformList(tree.declarations);
    if (declarations === tree.declarations) {
      return tree;
    }
    return new VariableDeclarationList(tree.location, tree.declarationType, declarations);
  }
  transformVariableStatement(tree) {
    let declarations = this.transformAny(tree.declarations);
    if (declarations === tree.declarations) {
      return tree;
    }
    return new VariableStatement(tree.location, declarations);
  }
  transformWhileStatement(tree) {
    let condition = this.transformAny(tree.condition);
    let body = this.transformToBlockOrStatement(tree.body);
    if (condition === tree.condition && body === tree.body) {
      return tree;
    }
    return new WhileStatement(tree.location, condition, body);
  }
  transformWithStatement(tree) {
    let expression = this.transformAny(tree.expression);
    let body = this.transformToBlockOrStatement(tree.body);
    if (expression === tree.expression && body === tree.body) {
      return tree;
    }
    return new WithStatement(tree.location, expression, body);
  }
  transformYieldExpression(tree) {
    let expression = this.transformAny(tree.expression);
    if (expression === tree.expression) {
      return tree;
    }
    return new YieldExpression(tree.location, expression, tree.isYieldFor);
  }
}
