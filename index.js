
var keys = require('keys')
  , query = require('query')
  , angular = require('angularjs')
  , events = require('event');

// angular modules
require('tags');
require('contenteditable');
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

angular.module('note', ['tags', 'contenteditable'])
  .directive('note', ['$compile',
    function ($compile) {
      return {
        scope: {},
        replace: true,
        restrict: 'A',
        link: function (scope, element, attrs) {
          var name = attrs.note
            , eventsName = attrs.events;
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
          // should be overwritten by parent
          scope.events = new Events();
          // if parent events changes for some reason...this shouldn't really happen
          scope.$parent.$watch(eventsName, function(value) {
            if (!value) return;
            scope.childEvents = value.child(function (evt) {
              if (scope.note.properties.type === 'major' &&
                  !scope.note.properties.top) {
                evt.path.unshift(scope.note.properties.slug);
              }
            });
            scope.events = value;
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
          scope.move = makeMovers(scope);
          scope.keydown = makeKeyMap(settings, scope);
          var keydown = keys(settings.getHashKeys(scope.keydown));
          events.bind(scope.title, 'keydown', keydown);
          events.bind(scope.title, 'blur', function () {
            if (scope.note.title === title) return;
            title = scope.note.title;
            scope.events.emit('title:change', {
              path: [],
              id: scope.note.properties.id,
              title: scope.note.title
            });
          });
        }
      };
    }]);

