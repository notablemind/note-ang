
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
          var title = query('.title', element[0]);
          events.bind(title, 'keydown', keys({
            'meta right|tab': function (e) {
              var pnote = scope.$parent.note;
              if (!pnote) return false;
              var ind = scope.$parent.$index;
              if (ind < 1) return false;
              var note = pnote.children.splice(ind, 1)[0];
              pnote.children[ind-1].children.push(note);
              var pnode = element[0].previousElementSibling;
              scope.$parent.$parent.$digest();
              var body = query('.body', pnode);
              query('.title', body.children[body.children.length - 1]).focus();
            },
            'meta left|shift tab': function (e) {
              var pnote = scope.$parent.note;
              if (!pnote) return false;
              var ppnote = scope.$parent.$parent.$parent.$parent.note;
              if (!ppnote) return false;
              var ind = scope.$parent.$index;
              var pind = scope.$parent.$parent.$parent.$index;
              var note = pnote.children.splice(ind, 1)[0];
              ppnote.children.splice(pind+1, 0, note); // [pind+1].children.push(note);
              var pnode = element[0].parentNode.parentNode.parentNode.parentNode;
              scope.$parent.$parent.$parent.$parent.$digest();
              query('.title', pnode.children[pind + 1]).focus();
            },
            'meta down': function (e) {
              var pnote = scope.$parent.note;
              if (!pnote) return false;
              var ind = scope.$parent.$index;
              if (ind >= pnote.children.length - 1) return false;
              var note = pnote.children.splice(ind, 1)[0];
              pnote.children.splice(ind + 1, 0, note);
              scope.$parent.$parent.$digest();
              title.focus();
            },
            'meta up': function (e) {
              var pnote = scope.$parent.note;
              if (!pnote) return false;
              var ind = scope.$parent.$index;
              if (ind < 1) return false;
              var note = pnote.children.splice(ind, 1)[0];
              pnote.children.splice(ind-1, 0, note);
              scope.$parent.$parent.$digest();
              title.focus();
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
              e.stopPropagation();
              e.preventDefault();
              return false;
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
              e.stopPropagation();
              e.preventDefault();
              return false;
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

