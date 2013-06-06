
// the keys here are tied to settings variables
module.exports.makeKeyMap = function (settings, el, scope) {
  return {
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
      var child;
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
    goUp: function (e) {
      var prevChild = el.previousElementSibling;
      , child;
      if (prevChild) {
        child = query.all('.title', prevChild);
        if (child) {
          child = child[child.length - 1];
        }
      }
      if (!child) {
        var parent = el.parentNode.parentNode;
        child = query('.title', parent);
      }
      if (child)
        child.focus();
    },
    editTags: function (e) {
      query('.tags input', el).focus();
    }
  };
};
