
var keys = require('keys')
  , query = require('query')
  , angular = require('angularjs')
  , events = require('event')

  // angular modules
  , tags = require('tags')
  , contentEditable = require('contenteditable');

var settings = require('settings')('note')
  , angularSettings = require('angular-settings');

var settingsShortcut = require('settings-shortcut');
angularSettings.register('keyboard-shortcut', settingsShortcut);

var template = require('./template')
  , defaultSettings = require('./settings')
  , makeKeyMap = require('./keymap').makeKeyMap
  , Events = require('scoped-events')
  , makeMovers = require('./movement').makeMovers;

settings.config(defaultSettings);

function fragmentEmpty(fragment) {
  var d = document.createElement('div');
  d.appendChild(fragment);
  return d.innerText.length === 0;
}

module.exports = angular.module('note', [tags.name, contentEditable.name])
  .directive('note', ['$compile', 'events',
    function ($compile, io) {
      return {
        scope: {},
        replace: true,
        restrict: 'A',
        link: function (scope, element, attrs) {
          var name = attrs.note;
          element.html(template);
          $compile(element.contents())(scope);
          var title;
          // bind note
          scope.$parent.$watch(name, function(value) {
            scope.note = value;
            title = value.title;
          });
          scope.$watch('note', function(value) {
            scope.$parent[name] = value;
            title = value.title;
          });
          // lookup other things
          scope.parent = null;
          if (scope.$parent.$parent &&
              scope.$parent.$parent.move) {
            scope.parent = scope.$parent.$parent;
          }
          scope.el = element[0];
          scope.title = query('.title', scope.el);
          scope.body = query('.body', scope.el);
          scope.index = function () {
            return scope.$parent.$index;
          };
          scope.move = makeMovers(io, scope);
          scope.keydown = makeKeyMap(settings, scope);
          var keyhash = settings.getHashKeys(scope.keydown);
          keyhash.left = function (e) {
            var range = window.getSelection().getRangeAt(0)
              , clone = range.cloneRange();
            if (!range.collapsed) return true;
            clone.selectNodeContents(scope.title);
            clone.setEnd(range.endContainer, range.endOffset);
            if (clone.toString().trim().length !== 0) return true;
            scope.keydown['nav.goUp'](e, true);
          };
          keyhash.right = function (e) {
            var range = window.getSelection().getRangeAt(0)
              , clone = range.cloneRange();
            if (!range.collapsed) return true;
            clone.selectNodeContents(scope.title);
            clone.setStart(range.endContainer, range.endOffset);
            if (clone.toString().trim().length !== 0) return true;
            scope.keydown['nav.goDown'](e);
          };
          keyhash.backspace = function (e) {
            if (!scope.parent) return;
            if (scope.note.title.trim().length > 0 && scope.note.title !== '<br>') {
              var range = window.getSelection().getRangeAt(0)
              , clone = range.cloneRange();
              if (!range.collapsed) return true;
              clone.selectNodeContents(scope.title);
              clone.setEnd(range.endContainer, range.endOffset);
              if (!fragmentEmpty(clone.cloneContents())) return true;
            } else {
              scope.note.title = '';
            }
            scope.deleted = true;
            scope.parent.move.removeChild(scope);
          };
          var keydown = keys(keyhash);
          events.bind(scope.title, 'keydown', keydown);
          var dirtyTimeout = null
            , longerTimeout = null;
          function saveTitle() {
            if (dirtyTimeout) clearTimeout(dirtyTimeout);
            if (longerTimeout) clearTimeout(longerTimeout);
            dirtyTimeout = null;
            longerTimeout = null;
            if (scope.deleted) return;
            if (scope.note.title === title) return;
            title = scope.note.title;
            io.emit('change', {
              path: [],
              id: scope.note.properties.id
            });
            console.log('saving');
          }
          events.bind(scope.title, 'keydown', function () {
            if (dirtyTimeout) clearTimeout(dirtyTimeout);
            dirtyTimeout = setTimeout(saveTitle, 500);
            if (!longerTimeout) setTimeout(saveTitle, 2000);
          });
          events.bind(scope.title, 'blur', saveTitle);
        }
      };
    }])
  .factory('events', function () {
    var Emitter = require('emitter');
    return new Emitter();
  });

