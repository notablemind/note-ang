var query = require('query');

// the keys here are tied to settings variables
module.exports.makeKeyMap = function (settings, scope) {
  return {
    'nav.moveRight': function (e) {
      if (!scope.parent) return;
      scope.parent.move.right(scope);
    },
    'nav.moveLeft': function (e) {
      if (!scope.parent || !scope.parent.parent) return;
      scope.parent.parent.move.left(scope, scope.parent);
    },
    'nav.moveDown': function (e) {
      if (!scope.parent) return;
      if (settings.get('nav.movementStyle') == 'org') {
        scope.parent.move.down(scope);
      } else {
        scope.parent.move.downWF(scope);
      }
    },
    'nav.moveUp': function (e) {
      if (!scope.parent) return;
      if (settings.get('nav.movementStyle') == 'org') {
        scope.parent.move.up(scope);
      } else {
        scope.parent.move.upWF(scope);
      }
    },
    'nav.goDown': function (e) {
      var child, el = scope.el;
      if (!scope.note.children.length) {
        while (!el.nextElementSibling && el.classList.contains('child')) {
          el = el.parentNode.parentNode.parentNode;
        }
        child = query('.title', el.nextElementSibling);
      } else {
        child = query('.title', query('.body', el));
      }
      child.focus();
    },
    'nav.goUp': function (e) {
      var prevChild = scope.el.previousElementSibling
        , child;
      if (prevChild) {
        child = query.all('.title', prevChild);
        if (child) {
          child = child[child.length - 1];
        }
      }
      if (!child) {
        var parent = scope.el.parentNode.parentNode;
        child = query('.title', parent);
      }
      if (child)
        child.focus();
    },
    'nav.editTags': function (e) {
      query('.tags input', scope.el).focus();
    }
  };
};
