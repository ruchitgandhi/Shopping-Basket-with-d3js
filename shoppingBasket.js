/* Created on jsFiddle */

//Fruits, Vegetables and each basket is a group
//Groups have name, groupId, transitions possible from the group, icon of the group and color of the group
var listOfGroups = [{
  name: 'Fruits',
  groupId: 1,
  transitions: ['RedBasket', 'BlueBasket', 'GreenBasket', 'PurpleBasket', 'YellowBasket'],
  icon: 'arrow-up',
  color: 'green'
}, {
  name: 'Vegetables',
  groupId: 2,
  transitions: ['RedBasket', 'BlueBasket', 'GreenBasket', 'PurpleBasket', 'YellowBasket'],
  icon: 'arrow-up',
  color: 'green'
}, {
  name: 'RedBasket',
  groupId: 3,
  transitions: ['Fruits', 'Vegetables'],
  icon: 'shopping-cart',
  color: 'LightCoral'
}, {
  name: 'GreenBasket',
  groupId: 4,
  transitions: ['Fruits', 'Vegetables'],
  icon: 'shopping-cart',
  color: 'LightGreen'
}, {
  name: 'PurpleBasket',
  groupId: 5,
  transitions: ['Fruits', 'Vegetables'],
  icon: 'shopping-cart',
  color: 'Plum'
}, {
  name: 'YellowBasket',
  groupId: 6,
  transitions: ['Fruits', 'Vegetables'],
  icon: 'shopping-cart',
  color: 'Orange'
}, {
  name: 'BlueBasket',
  groupId: 7,
  transitions: ['Fruits', 'Vegetables'],
  icon: 'shopping-cart',
  color: 'AliceBlue'
}];

//Array of all the fruits and vegetables, with the group they belong to and their current location which keeps getting updated as they are moved around.
var allItems = [{
  groupId: 1,
  name: 'Peach',
  currentLoc: 'Fruits'
}, {
  groupId: 1,
  name: 'Strawberry',
  currentLoc: 'Fruits'
}, {
  groupId: 1,
  name: 'Watermelon',
  currentLoc: 'Fruits'
}, {
  groupId: 1,
  name: 'Grapes',
  currentLoc: 'Fruits'
}, {
  groupId: 1,
  name: 'Apple',
  currentLoc: 'Fruits'
}, {
  groupId: 1,
  name: 'Banana',
  currentLoc: 'Fruits'
}, {
  groupId: 2,
  name: 'Carrot',
  currentLoc: 'Vegetables'
}, {
  groupId: 2,
  name: 'Lettuce',
  currentLoc: 'Vegetables'
}, {
  groupId: 2,
  name: 'Radish',
  currentLoc: 'Vegetables'
}, {
  groupId: 2,
  name: 'Cucumber',
  currentLoc: 'Vegetables'
}];

//Find Group in List of Groups
var getListOfGroups = (function() {
  var listRegistry = {};
  listOfGroups.forEach(function(ls, i) {
    listRegistry[ls.groupId] = i;
    listRegistry[ls.name] = i;
  });
  return function(x) {
    return listOfGroups[listRegistry[x]];
  }
}());

function getList(x) {
  var name = x.name || getListOfGroups(x).name;
  return lists[name];
}

var Item = function(itemSpec) {
  this.groupId = itemSpec.groupId;
  this.name = itemSpec.name;
  this.list = undefined;
  this.addTo(itemSpec.groupId);
};
Item.prototype.degroup = function() {
  if (this.list) {
    this.list.splice(this.list.indexOf(this), 1);
  }
};
Item.prototype.addTo = function(s) {
  var list = getList(s);
  this.list = list;
  list.push(this);
};

listOfGroups.forEach(function(ls) {
  lists[ls.name] = [];
  lists[ls.name].spec = ls;
  Item.prototype[ls.name] = function() {
    this.degroup();
    this.addTo(ls.groupId);
  };
});

allItems.map(function(spec) {
  new Item(spec);
});

//Handle addition of groups
var group = d3.select('#lists')
  .selectAll('div.group')
  .data(listOfGroups);

var newgroup = group.enter().append('div').attr('class', 'group');

//Handle group heading
var grouphead = newgroup.append('div').attr('class', 'grouphd');
grouphead.append('span')
  .text(function(ls) {
    return ls.name
  })
  .attr('class', 'list-name')
grouphead.append('span')
  .attr('class', 'list-len')

newgroup.append('ul')
  .attr('id', function(ls) {
    return ls.name
  })
  .attr('class', 'list list-unstyled');

render();

//Function to render the groups again after a move is made
function render() {

  //To display count of items in the group
  group.selectAll('.list-len')
    .text(function(ls) {
      return ' - [' + getList(ls).length + ']'
    });
  group.each(function(ls) {

    var items = getList(ls);

    //Add all items to the group
    var li = d3.select(this).select('ul').selectAll('li')
      .data(items, function(d) {
        return d.name
      });

    li.exit().remove();

    d3.select(this).select('p.empty').remove();

    //Handle empty groups
    if (items.length === 0) {
      d3.select(this).append('p')
        .attr('class', 'empty')
        .text('Nothing here');
      return;
    }

    var itemName;
    var newli = li.enter().append('li');
    newli.append('span')
      .text(function(d, x) {
        itemName = d.name;
        return itemName;
      });

    //Transition buttons with onclick behaviour
    newli.append('div')
      .attr('class', 'ctrl')
      .call(function(wrapper) {
        ls.transitions.forEach(function(name, index) {
          var showButton = false; //Variable to control the showing of only valid transtions buttons. For eg: "vegetable" transition button is not shown to a fruit like Peach.

          //Basket buttons are always shown
          if (name.includes('Basket')) {
            showButton = true;
          } else if (itemName) {
            for (var i = 0; i < allItems.length; i++) {
              //Fruit and Vegetable button is only shown depending on the type of the item
              if (itemName === allItems[i].name && allItems[i].groupId === getListOfGroups(name).groupId) {
                showButton = true;
              }
            }
          }

          if (showButton) {
            wrapper.append('button')
              .attr('class', 'btn btn-secondary btn-sm ' + getGlyphicon(getListOfGroups(name).icon))
              .attr('style', 'background-color:' + getListOfGroups(name).color)
              .text(getListOfGroups(name).name)
              .on('click', function(d) {
                var destinationId = ls.transitions[index];
                var type = d.groupId;

                //If there is space in the basket then only allow movements. Movements back to fruit/vegetable groups is allowed.
                if (checkIfThereIsSpaceInBasket(destinationId, d)) {
                  d3.event.preventDefault();
                  d[name]();
                  render();
                }
              });
          }
        });
      });
  })
}

//Function to only allow one fruit and one vegetable in a basket. If a second fruit/vegetable is tried to move to basket it won't move.
function checkIfThereIsSpaceInBasket(destinationId, d) {
  for (var i = 0; i < allItems.length; i++) {
    var item = allItems[i];
    //By referring to Current Location in All item list , this condition is trying to find if an item from the same group (fruit/vegetable) is already present in the destination the other item is trying to go to - if so the movement is restricted by returning false and hence denying access.
    if (d.groupId === item.groupId && item.currentLoc === destinationId && isItemInBasket(item)) {
      return false;
    }
  }

  //Current Location of moved objects is updated
  for (var i = 0; i < allItems.length; i++) {
    if (d.name === allItems[i].name) {
      allItems[i].currentLoc = destinationId;
    }
  }
  return true;
}

function isItemInBasket(item) {
  if (item.currentLoc === 'RedBasket' || item.currentLoc === 'BlueBasket' || item.currentLoc === 'PurpleBasket' || item.currentLoc === 'GreenBasket' || item.currentLoc === 'YellowBasket') {
    return true;
  }
  return false;
}

//Function to get glyphicon icon based on group.
function getGlyphicon(i) {
  return 'glyphicon glyphicon-' + i;
}
