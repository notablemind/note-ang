
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
          var keydown = keys(settings.getHashKeys(scope.keydown));
          events.bind(scope.title, 'keydown', keydown);
          events.bind(scope.title, 'blur', function () {
            if (scope.note.title === title) return;
            title = scope.note.title;
            io.emit('change', {
              path: [],
              id: scope.note.properties.id
            });
          });
        }
      };
    }])
  .factory('events', function () {
    var Emitter = require('emitter');
    return new Emitter();
  });

