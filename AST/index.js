let esprima = require('esprima');
let estraverse = require('estraverse');
let escodegen = require('escodegen');

let code = `
function fn(){
    let start = 1; 
    console.log(start); 
}`;

let nodeStack = [];
let parserResult = esprima.parseModule(code);
let tag = (function() {
  let renameTag = '';
  let nameBuckets = ['a', 'b', 'c', 'd', 'e', 'f', 'e'];
  return {
    next: function() {
      renameTag = nameBuckets[nameBuckets.indexOf(renameTag) + 1];
      return renameTag;
    },
    reset: function() {
      renameTag = '';
    },
    find: function(name) {
      let len = nodeStack.length;
      while (len--) {
        if (nodeStack[len].id.originName == name) {
          return nodeStack[len].id._name;
        }
      }
      return 'undefined';
    }
  };
})();

let checkIn = function(node) {
  if (node.type == 'FunctionDeclaration') {
    let _node = Object.assign(node.id, { _name: tag.next(), originName: node.id.name });
    let _params = node.params.concat([]).map(item => {
      item._name = tag.next();
    });
    nodeStack.push({
      type: 'FunctionDeclaration',
      id: _node,
      params: _params
    });
  }

  if (node.type == 'VariableDeclarator') {
    let _id = Object.assign(node.id, { _name: tag.next(), originName: node.id.name });
    nodeStack.push({
      type: 'VariableDeclarator',
      id: _id,
      init: node.init
    });
  }

  if (node.type == 'CallExpression') {
    let _arguments = node.arguments.concat([]).map(args => {
      args._name = tag.find(args.name);
      args.originName = args.name;
      return args;
    });
    nodeStack.push({
      type: 'CallExpression',
      arguments: _arguments
    });
  }
};

let checkOut = function(node) {
  if (node.type === 'FunctionDeclaration') {
    node.id.name = node.id._name;
    node.params.forEach(p => {
      p.name = p._name;
    });
  }
  if (node.type === 'VariableDeclarator') {
    node.id.name = node.id._name;
  }

  if (node.type == 'CallExpression') {
    node.arguments.forEach(args => {
      args.name = args._name;
    });
  }
};

// excuisive ast tree
estraverse.traverse(parserResult, {
  enter(node) {
    // 入栈
    checkIn(node);
  },
  leave(node) {
    // 出栈
    checkOut(node);
  }
});

let parseResult = escodegen.generate(parserResult);
console.log(JSON.stringify(parseResult));
