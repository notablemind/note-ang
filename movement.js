
/**
 Thoughts: this isn't very decoupled.

 Maybe I could make a lib that only worked with the nested objects,
 and handled moving them around. Would that be useful?
 */

var query = require('query')
  , ObjectId = require('ObjectId.js');

function newNote() {
  var now = new Date().toString();
  return {
    title: '',
    tags: [],
    children: [],
    properties: {
      created: now,
      modified: now,
      id: ObjectId().toString()
    }
  };
}

function fragmentHtml(fragment) {
  var d = document.createElement('div');
  d.appendChild(fragment);
  return d.innerHTML;
}

function shareText(title, one, two) {
  var range = window.getSelection().getRangeAt(0)
    , clone = range.cloneRange();
  clone.selectNodeContents(title);
  clone.setStart(range.endContainer, range.endOffset);
  if (clone.toString().trim().length === 0) {
    return;
  }
  two.title = fragmentHtml(clone.extractContents());
  clone.selectNodeContents(title);
  clone.setEnd(range.startContainer, range.startOffset);
  one.title = fragmentHtml(clone.extractContents());
}

module.exports.makeMovers = function (io, scope) {
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
      var prev = scope.body.children[cindex-1];
      io.emit('move', {
        id: cnote.properties.id,
        pid: note.children[cindex-1].properties.id
      });
      scope.$digest();
      query('.title', query('.body', prev).lastElementChild).focus();
    },
    left: function (child, middle) {
      var cnote = child.note;
      if (!cnote) {
        console.error('Was expecting a child scope w/ note', child);
        return;
      }
      var note = scope.note;
      var mnote = middle.note;
      mnote.children.splice(child.index(), 1);
      var mindex = middle.index();
      note.children.splice(mindex + 1, 0, cnote);
      child.title.blur();
      io.emit('move', {
        id: cnote.properties.id,
        pid: note.properties.id,
        index: mindex + 1
      });
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
        io.emit('move', {
          id: cnote.properties.id,
          pid: pscope.note.properties.id,
          index: index + 1
        });
        pscope.$digest();
        query('.title', pscope.body.children[index + 1]).focus();
        return;
      }
      note.children.splice(cindex, 1);
      if (note.children[cindex].children.length) {
        io.emit('move', {
          id: cnote.properties.id,
          pid: note.children[cindex].properties.id,
          index: 0
        });
        note.children[cindex].children.unshift(cnote);
        cscope.title.blur();
        scope.$digest();
        query('.title', query('.body', scope.body.children[cindex])).focus();
      } else {
        io.emit('move', {
          id: cnote.properties.id,
          pid: note.properties.id,
          index: cindex + 1
        });
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
        pscope.note.children[index + 1].children.unshift(cnote);
        cscope.title.blur();
        io.emit('move', {
          id: cnote.properties.id,
          pid: pscope.note.children[index + 1].properties.id,
          index: 0
        });
        pscope.$digest();
        query('.title', query('.body', pscope.body.children[index + 1])).focus();
        return;
      }
      io.emit('move', {
        id: cnote.properties.id,
        pid: note.properties.id,
        index: cindex + 1
      });
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
        io.emit('move', {
          id: cnote.properties.id,
          pid: pscope.note.children[index - 1].properties.id
        });
        pscope.$digest();
        query('.title', query('.body', pscope.body.children[index - 1]).lastElementChild).focus();
        return;
      }
      note.children.splice(cindex, 1);
      note.children.splice(cindex - 1, 0, cnote);
      io.emit('move', {
        id: cnote.properties.id,
        pid: note.properties.id,
        index: cindex - 1
      });
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
        io.emit('move', {
          id: cnote.properties.id,
          pid: pscope.note.properties.id,
          index: index
        });
        pscope.$digest();
        query('.title', pscope.body.children[index]).focus();
        return;
      }
      note.children.splice(cindex, 1);
      if (note.children[cindex - 1].children.length) {
        io.emit('move', {
          id: cnote.properties.id,
          pid: note.children[cindex - 1].properties.id
        });
        note.children[cindex - 1].children.push(cnote);
        cscope.title.blur();
        scope.$digest();
        query('.title', query('.body', scope.body.children[cindex - 1]).lastElementChild).focus();
      } else {
        io.emit('move', {
          id: cnote.properties.id,
          pid: note.properties.id,
          index: cindex - 1
        });
        note.children.splice(cindex - 1, 0, cnote);
        cscope.title.blur();
        scope.$digest();
        cscope.title.focus();
      }
    },

    newAfter: function (cscope) {
      var cindex = cscope.index()
        , child = newNote();
      if (cscope.note.children.length) {
        return cscope.move.newChild();
      }
      shareText(cscope.title, cscope.note, child);
      scope.note.children.splice(cindex + 1, 0, child);
      io.emit('create', {
        id: child.properties.id,
        pid: scope.note.properties.id,
        note: child
      });
      scope.$digest();
      query('.title', scope.body.children[cindex + 1]).focus();
    },

    newChild: function () {
      var child = newNote();
      scope.note.children.unshift(child);
      shareText(scope.title, scope.note, child);
      io.emit('create', {
        id: child.properties.id,
        pid: scope.note.properties.id,
        note: child
      });
      scope.$digest();
      query('.title', scope.body).focus();
    },

    removeChild: function (cscope) {
      var cindex = cscope.index()
        , cnote  = cscope.note
        , note = scope.note;
      note.children.splice(cindex, 1);
      if (cnote.title.length) {
        if (cindex > 0) {
          note.children[cindex - 1].title += ' ' + cnote.title;
          note.children[cindex - 1].title = note.children[cindex - 1].title.trim();
        } else {
          note.title += ' ' + cnote.title;
          note.title = note.title.trim();
        }
      }
      io.emit('delete', {id: cnote.properties.id});
      cscope.title.blur();
      scope.$digest();
      var title;
      if (cindex > 0) {
        title = query('.title', scope.body.children[cindex - 1]);
      } else {
        title = scope.title;
      }
      title.focus();
      var sel = window.getSelection();
      sel.selectAllChildren(title);
      sel.collapseToEnd();
    }
  };
};


