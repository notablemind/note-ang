
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

var mapKeys = function (settings, keymap) {
  var names = Object.keys(keymap);
  var map = {};
  for (var i=0; i<names.length; i++) {
    var value = settings.get(names[i]);
    if (!value) {
      console.error('Invalid setting name in keymap: ' + names[i]);
      continue;
    }
    map[value] = keymap[names[i]];
  }
  return keys(map);
};

var makeMovers = function (scope) {
  return {
    right: function (cscope) {
      var cnote = cscope.note;
      if (!cnote) {
        console.error('Was expecting a child scope w/ note', cscope);
        return;
      }
      if (cscope.index() < 1) return;
      var note = scope.note;
      var cindex = cscope.index();
      note.children.splice(cindex, 1);
      note.children[cindex-1].children.push(cnote);
      cscope.title.blur();
      scope.$digest();
      var prev = scope.body.children[cindex-1];
      query('.title', query('.body', prev).lastElementChild).focus();
    },
    left: function (child, middle) {
      var cnote = child.note;
      if (!cnote) {
        console.error('Was expecting a child scope w/ note', cscope);
        return;
      }
      var note = scope.note;
      var mnote = middle.note;
      mnote.children.splice(child.index(), 1);
      var mindex = middle.index();
      note.children.splice(mindex + 1, 0, cnote);
      child.title.blur();
      scope.$digest();
      query('.title', scope.body.children[mindex + 1]).focus();
    },

    downWF: function (cscope) {
      var cindex = cscope.index();
      var cnote  = cscope.note;
      var note = scope.note;
      // move out of this item and over to the next one
      if (cindex >= note.children.length - 1) {
        if (!scope.parent) return;
        var index = scope.index();
        if (index >= scope.parent.note.children.length - 1)
          return scope.parent.move && scope.parent.move.left(cscope, scope);
        note.children.splice(cindex, 1);
        var pscope = scope.parent;
        pscope.note.children.splice(index + 1, 0, cnote);
        cscope.title.blur();
        pscope.$digest();
        query('.title', pscope.body.children[index + 1]).focus();
        return;
      }
      note.children.splice(cindex, 1);
      if (note.children[cindex].children.length) {
        note.children[cindex].children.unshift(cnote);
        cscope.title.blur();
        scope.$digest();
        query('.title', query('.body', scope.body.children[cindex])).focus();
      } else {
        note.children.splice(cindex + 1, 0, cnote);
        cscope.title.blur();
        scope.$digest();
        cscope.title.focus();
      }
    },
      
    down: function (cscope) {
      var cindex = cscope.index();
      var cnote  = cscope.note;
      var note = scope.note;
      // move out of this item and over to the next one
      if (cindex >= note.children.length - 1) {
        if (!scope.parent) return;
        var index = scope.index();
        if (index >= scope.parent.note.children.length - 1)
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
      var cnote  = cscope.note;
      var note = scope.note;
      // move out of this item and over to the next one
      if (cindex < 1) {
        if (!scope.parent) return;
        var index = scope.index();
        if (index < 1)
          return;
        note.children.splice(cindex, 1);
        var pscope = scope.parent;
        pscope.note.children[index - 1].children.push(cnote);
        cscope.title.blur();
        pscope.$digest();
        query('.title', query('.body', pscope.body.children[index - 1]).lastElementChild).focus();
        return;
      }
      note.children.splice(cindex, 1);
      note.children.splice(cindex - 1, 0, cnote);
      cscope.title.blur();
      scope.$digest();
      cscope.title.focus();
    },

    upWF: function (cscope) {
      var cindex = cscope.index();
      var cnote  = cscope.note;
      var note = scope.note;
      // move out of this item and over to the next one
      if (cindex < 1) {
        if (!scope.parent) return;
        var index = scope.index();
        note.children.splice(cindex, 1);
        var pscope = scope.parent;
        pscope.note.children.splice(index, 0, cnote);
        cscope.title.blur();
        pscope.$digest();
        query('.title', pscope.body.children[index]).focus();
        return;
      }
      note.children.splice(cindex, 1);
      if (note.children[cindex - 1].children.length) {
        note.children[cindex - 1].children.push(cnote);
        cscope.title.blur();
        scope.$digest();
        query('.title', query('.body', scope.body.children[cindex - 1]).lastElementChild).focus();
      } else {
        note.children.splice(cindex - 1, 0, cnote);
        cscope.title.blur();
        scope.$digest();
        cscope.title.focus();
      }
    }
  };
};

module.exports = {
  deps: {
    'tags': require('tags'),
    'contenteditable': require('contenteditable')
  },
  directive: ['$compile', 'settings',
    function($compile, settings){
      return {
        scope: {},
        replace: true,
        restrict: 'A',
        // template: template,
        // terminal: true,
        link: function (scope, element, attrs) {
          var name = attrs.note;
          element.html(template);
          $compile(element.contents())(scope);
          scope.$parent.$watch(name, function(value) {
            scope.note = value;
          });
          scope.$watch('note', function(value) {
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
          scope.move = makeMovers(scope);
          var keymap = {
            moveRight: function (e) {
              if (!scope.parent) return;
              scope.parent.move.right(scope);
            },
            moveLeft: function (e) {
              if (!scope.parent || !scope.parent.parent) return;
              scope.parent.parent.move.left(scope, scope.parent);
            },
            moveDown: function (e) {
              if (!scope.parent) return;
              if (settings.get('movementStyle') == 'org') {
                scope.parent.move.down(scope);
              } else {
                scope.parent.move.downWF(scope);
              }
            },
            moveUp: function (e) {
              if (!scope.parent) return;
              if (settings.get('movementStyle') == 'org') {
                scope.parent.move.up(scope);
              } else {
                scope.parent.move.upWF(scope);
              }
            },
            goDown: function (e) {
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
            goUp: function (e) {
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
            editTags: function (e) {
              query('.tags input', element[0]).focus();
              e.stopPropagation();
              e.preventDefault();
              return false;
            }
          };
          events.bind(title, 'keydown', mapKeys(settings, keymap));
        }
      };
    }]
};
