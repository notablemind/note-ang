
/**
 Thoughts: this isn't very decoupled.

 Maybe I could make a lib that only worked with the nested objects,
 and handled moving them around. Would that be useful?
 */

var query = require('query');

module.exports.makeMovers = function (scope) {
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


