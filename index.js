
var template = require('./template');
var keys = require('keys');
var query = require('query');
var events = require('event');

var prev = function (el) {
  return el.previousElementSibling;
};

var next = function (el) {
  return el.nextElementSibling;
};

var tryquery = function (sel, el) {
  try {
    return query(sel, el);
  } catch (e) {
    return null;
  }
};

var ng = {
  deps: {
    'tags': require('tags'),
    'contenteditable': require('contenteditable')
  },
  directive: ['$compile',
    function($compile){
      return {
        scope: {},
        replace: true,
        restrict: 'A',
        // template: template,
        // terminal: true,
        link: function (scope, element, attrs) {
          var name = attrs.note;
          var localName = 'note';
          element.html(template);
          $compile(element.contents())(scope);
          scope.$parent.$watch(name, function(value) {
            scope[localName] = value;
          });
          scope.$watch(localName, function(value) {
            scope.$parent[name] = value;
          });
          var selTitle = '.note > .head .title';
          var title = scope.title = query('.title', element[0]);
          scope.parent = null;
          if (scope.$parent.$parent &&
              scope.$parent.$parent.move) {
            scope.parent = scope.$parent.$parent;
          }
          scope.el = element[0];
          var body = scope.body = query('.body', scope.el);
          scope.index = function () {
            return scope.$parent.$index;
          };
          scope.move = {
            right: function (cscope) {
              var cnote = cscope[localName];
              if (!cnote) {
                console.error('Was expecting a child scope w/ note', cscope);
                return;
              }
              if (cscope.index() < 1) return;
              var note = scope[localName];
              var cindex = cscope.index();
              note.children.splice(cindex, 1);
              note.children[cindex-1].children.push(cnote);
              cscope.title.blur();
              scope.$digest();
              var prev = body.children[cindex-1];
              query('.title', query('.body', prev).lastElementChild).focus();
            },
            left: function (child, middle) {
              var cnote = child[localName];
              if (!cnote) {
                console.error('Was expecting a child scope w/ note', cscope);
                return;
              }
              var note = scope[localName];
              var mnote = middle[localName];
              mnote.children.splice(child.index(), 1);
              var mindex = middle.index();
              note.children.splice(mindex + 1, 0, cnote);
              child.title.blur();
              scope.$digest();
              query('.title', body.children[mindex + 1]).focus();
            },
            down: function (cscope) {
              var cindex = cscope.index();
              var cnote  = cscope[localName];
              var note = scope[localName];
              // move out of this item and over to the next one
              if (cindex >= note.children.length - 1) {
                if (!scope.parent) return;
                var index = scope.index();
                if (index >= scope.parent[localName].children.length - 1)
                  return;
                note.children.splice(cindex, 1);
                var pscope = scope.parent;
                pscope.note.children[index + 1].children.splice(0, 0, cnote);
                cscope.title.blur();
                pscope.$digest();
                query('.title', query('.body', pscope.body.children[index + 1])).focus();
                return;
              }
              note.children.splice(cindex, 1);
              note.children.splice(cindex + 1, 0, cnote);
              cscope.title.blur();
              scope.$digest();
              cscope.title.focus();
            },
            up: function (cscope) {
              var cindex = cscope.index();
              var cnote  = cscope[localName];
              var note = scope[localName];
              // move out of this item and over to the next one
              if (cindex < 1) {
                if (!scope.parent) return;
                var index = scope.index();
                if (index < 1)
                  return;
                note.children.splice(cindex, 1);
                var pscope = scope.parent;
                pscope.note.children[index - 1].children.splice(0, 0, cnote);
                cscope.title.blur();
                pscope.$digest();
                query('.title', query('.body', pscope.body.children[index - 1])).focus();
                return;
              }
              note.children.splice(cindex, 1);
              note.children.splice(cindex - 1, 0, cnote);
              cscope.title.blur();
              scope.$digest();
              cscope.title.focus();
            }
          };
              
          events.bind(title, 'keydown', keys({
            'alt right|tab': function (e) {
              if (!scope.parent) return;
              scope.parent.move.right(scope);
            },
            'alt left|shift tab': function (e) {
              if (!scope.parent || !scope.parent.parent) return;
              scope.parent.parent.move.left(scope, scope.parent);
            },
            'alt down|ctrl S': function (e) {
              if (!scope.parent) return;
              scope.parent.move.down(scope);
            },
            'alt up|ctrl W': function (e) {
              if (!scope.parent) return;
              scope.parent.move.up(scope);
            },
            'ctrl D|down': function (e) {
              var child = query('.title', query('.body', element[0]));
              if (!child) {
                var el = element[0];
                while (!el.nextElementSibling && el.classList.contains('child')) {
                  el = el.parentNode.parentNode.parentNode;
                }
                child = query('.title', el.nextElementSibling);
              }
              child.focus();
            },
            'ctrl E|up': function (e) {
              var prevChild = prev(element[0])
                , child;
              if (prevChild) {
                child = query.all('.title', prevChild);
                if (child) {
                  child = child[child.length - 1];
                }
              }
              if (!child) {
                var parent = element[0].parentNode.parentNode;
                child = tryquery('.title', parent);
              }
              if (child)
                child.focus();
            },
            'ctrl space': function (e) {
              query('.tags input', element[0]).focus();
              e.stopPropagation();
              e.preventDefault();
              return false;
            }
          }));
        }
      };
    }]
};

module.exports = ng;

