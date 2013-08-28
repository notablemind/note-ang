
module.exports = {
  nav: {
    _group: true,
    _type: 'keyboard-shortcut',
    movementStyle: {
      value: 'flat',
      options: ['org', 'flat'],
      type: 'radio',
      description: 'style of moving items up and down. Org will jump past items of the same level'
    },
    goUp: {
      value: 'up|ctrl E',
      description: 'select the previous item'
    },
    goDown: {
      value: 'down|ctrl D',
      description: 'select the next item'
    },
    moveUp: {
      value: 'alt up|alt W',
      description: 'move the current item up'
    },
    moveDown: {
      value: 'alt down|alt S',
      description: 'move the current item down'
    },
    moveLeft: {
      value: 'alt left|alt A',
      description: 'move the current item left'
    },
    moveRight: {
      value: 'alt right|alt D',
      description: 'move the current item right'
    },
    editTags: {
      value: 'ctrl space',
      description: 'edit the tags of the current item'
    }
  }
};

