
var template = require('./template');

var ng = {
    deps: {'tags': require('tags')},
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
      }
    };
  }]
};

module.exports = ng;


