
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
            'tab|down': function (e) {
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
            'shift tab|up': function (e) {
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

