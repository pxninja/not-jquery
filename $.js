//-- SELECTOR FUNCTION --//

// This simplifies node selection in a jQuery-like fashion, bloat free.
// Looks like jQuery, but is absolutely not jQuery and cannot be used with jQuery.

// Ex: $('#myId')
// Ex: $('#myId','.show')

function $ (selector, attributes) {
  if (!selector) return this;
  if (typeof selector === 'string') {
    let nodes = document.querySelectorAll(selector);
    switch (nodes.length) {
      case 0 : selector = null;     break;
      case 1 : selector = nodes[0]; break;
      default: selector = nodes;    break;
    }
  }
  return !attributes ? selector : selector.ƒ(attributes);
};



// -- ATTRIBUTE MANIPULATION FUNCTION -- //

// This can be used on any object, dependency free, though it's
// intended to support the $() selector function.

// The 'ƒ' character was chosen to help avoid namespace collisions.
// If you change the name of the prototype, also change it in
// in the return line of the $() selector function.

Object.prototype.ƒ = function (string) {

  // IF the string is actually a number, treat it like an index
  // and return the corresponding node, where 'obj.ƒ(0)'
  // is the first node, 'obj.ƒ(-1)'' is the last, etc.

  const i = parseInt(string);
  if (!isNaN(i) && typeof i === 'number') {
    switch (i < 0) {
      case true:  return this[this.length + i]; break;
      case false: return this[i]; break;
    }
  }


  // It's important the number check occurs first, because '0' is
  // both a 'number' and 'false', making '!0' return as 'true'.
  // If the string was '0',  then '!string' would return 'true',
  // which would trigger the following statement and the
  // number evaluation would never occur.

  // Exit if no object or string exist, or if the string is not a 'string'
  if (!this || !string || typeof i === 'string') return this;


  // Because the first / last string characters are evaluated as operators,
  // leading / trailing white space needs to be removed.

  // Trim off leading / trailing white space
  string = string.trim();


  // Set which characters will be evaluated as operation symbols.
  const operator = {
    0: '±+-?',                    // Toggle, Add, Remove, Get
    1: string[0],                 // First character of string
    2: string[string.length - 1], // Last character of string
    3: string[string.length - 2]  // Second-to-last character
  };


  // Putting the operator at the beginning of the string is a best practice.
  // Ex: obj.ƒ('+ .myClass')

  // Check if the first character is an operator.
  if (operator[0].includes(operator[1])) return _doSomething.bind(this)(operator[1], 1, string.length);


  // Because '-' can be a valid string part, if the operator is
  // placed at the end of the string, it must be separated
  // from the string by a space. For example, because
  // 'myClass-' is a valid class, it would need to be
  // 'myClass -' to be removed.
  // Ex: obj.ƒ('.myClass -') => removes 'myClass'
  // Ex: obj.ƒ('.myClass-')  => toggles 'myClass-'

  // Check if the last character is an operator preceded by a space.
  if (operator[0].includes(operator[2]) && operator[3] === ' ') return _doSomething.bind(this)(operator[2], 0, -1);


  // If no operator was specified, toggle the inclusion / exclusion
  // of the specified attribute(s).
  return _modify.bind(this)(_parse(string), '±');
  

  // Helper function to execute a specific operation.
  // o - the operation to execute
  // a - starting index of slice
  // b - ending index of slice
  function _doSomething (o,a,b) {

    // Parse the string for attribute(s)
    const s = _parse(string.slice(a,b));
    
    // Check if GET is the intention
    if (o === '?') return _get.bind(this)(s);
    
    // Otherwise MODIFY the attribute(s)
    else return _modify.bind(this)(s, o);
  }

  // PARSE string for the space separated attribute(s)
  // Matches #idString: #([^\s#."']+)
  // Matches .classStr: \.([^\s#."']+)
  // Matches key="val": ([\w-]+)\s*=\s*["']([^"']+)["']|(\b[\w-]+\b)
  // Example result:
  // { "class": ["classOne", "classTwo"],
  //   "data-blob": "some data",
  //   "disabled": true,
  //   "id": "myID" }
  function _parse (string) {
    let regex = /#([^\s#."']+)|\.([^\s#."']+)|([\w-]+)\s*=\s*["']([^"']+)["']|(\b[\w-]+\b)/g;
    let match; const result = {};
    
    while ((match = regex.exec(string)) !== null) {
      if (match[1]) result.id = match[1];
      else if (match[2]) result.class = [...(result.class || []), match[2]];
      else if (match[3] && match[4]) {
        if (match[3] === 'class') result.class = match[4].split(/\s+/);
        else result[match[3]] = match[4];
      }
      else if (match[5]) result[match[5]] = '';
    }
    return result;
  };

  // MODIFY the element(s)
  // Any attribute value can be set with a 'key="val"' pattern.
  // Any attribute value can be removed with only the 'key'.
  // Classes and id's can be referenced with symbols.
  // Multiple attributes may be added/removed/toggled simultaneously.
  // Only one operation is executed.
  // NodeLists are supported.
  function _modify (attributes, operation) {
    elements = this instanceof NodeList ? this : [this];
    elements.forEach(element => _art(element, attributes, operation));
    return this;
  }

  // ADD / REMOVE / TOGGLE the attribute(s)
  function _art (element, attributes, operation) {
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        const value = attributes[key];
        if (key === 'class') {
          switch (operation) {
            case '+': value.forEach(className => element.classList.add(className));    break;
            case '-': value.forEach(className => element.classList.remove(className)); break;
            case '±': value.forEach(className => element.classList.toggle(className)); break;
          }
        } else {
          switch (operation) {
            case '+': element.setAttribute(key, value);    break;
            case '-': element.removeAttribute(key, value); break;
            case '±': element.getAttribute(key) === value ? element.removeAttribute(key) : element.setAttribute(key, value); break;
          }
        }
      }
    }
  }
  
  // GET attribute(s)
  // Returns either a string or bool, depending on the query ...
  
  // Returns an attributes value() as a string when a single attribute name
  // is queried and the attribute exists.
  // Ex: obj.ƒ('? class') => "classOne classTwo"

  // If an attribute name exists, but no value exists, an empty string
  // will return.
  // Ex: obj.ƒ('? open') => ""

  // Returns 'undefined' when a single attribute name is queried and the
  // attribute name is absent.
  // Ex: obj.ƒ('? disabled') => undefined

  // Returns 'false' when not all queried attributes or values are present.
  // Ex: obj.ƒ('? id class') => false - either id or class is absent
  // Ex: obj.ƒ('? .myClass') => false - myClass is absent

  // Returns 'true'  when all queried attributes and values are present.
  // Ex: obj.ƒ('? id class') => true - both id and class have values
  // Ex: obj.ƒ('? .myClass') => true - myClass is present

  // If the operation is performed on a NodeList,
  // results return in an array per node.
  function _get (attributes) {
    const result = [];
    elements = this instanceof NodeList ? this : [this];
    elements.forEach(element => result.push(_eval(element, attributes)));
    return result.length > 1 ? result : result[0];
  }

  // EVALUATE attribute(s)
  // A helper function containing the core _get() logic.
  function _eval (element, attributes) {
    let result = {};
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        const value = attributes[key];
        if (key === 'class' && Array.isArray(value)) {
          value.forEach(className => result.class = [...(result.class || []), element.classList.contains(className)]);
          result.class = result.class.every(boolean => boolean === true);
        } else {
          result[key] = element.getAttribute(key) ?? undefined;
        }
      }
    }

    if (Object.keys(result).length > 1) {

      for (const key in result) {
        if (result.hasOwnProperty(key) && !result[key]) {
          result = false;
          break;
        }
      }

      if (result !== false) result = true;

    } else if (Object.keys(result).length == 1) {

      result = result[Object.keys(result)[0]];

    } else {
      result = false;
    }

    return result;
  }
};



//-- OTHER OBJECT PROTOTYPES --//
// These can be used on any object, dependency free.

// Helper functions for the object prototypes
function ƒ_getNodeList (obj) {
  return obj instanceof NodeList ? obj : [obj];
}
function ƒ_eventListener (obj, task, type, func) {
  elems = ƒ_getNodeList(obj);
  switch (task) {
    case 'add' : elems.forEach(e => e.addEventListener(type, func));    break;
    case 'rem' : elems.forEach(e => e.removeEventListener(type, func)); break;
    default: break;
  }
}


// These are identical with the vanilla JS event listener
// declarations, just more succinct with the capability
// of looping through a node list.

// Add listener
Object.prototype.on = function (type, func) {
  ƒ_eventListener(this, 'add', type, func);
  return this;
};

// Remove listener
Object.prototype.off = function (type, func) {
  ƒ_eventListener(this, 'rem', type, func);
  return this;
};

// Enumerate the event listeners and the elements they are attached to.
Object.prototype.listeners = function () {
  const result = {};
  const elems  = ƒ_getNodeList(this);
  elems.forEach(e => {
    const list = getEventListeners(e);
    for (const type in list ) {
      if (list.hasOwnProperty(type)) {
        if (!result[type]) result[type] = [];
        result[type].push([e, list[type][0]]);
      }
    }
  });
  return Object.keys(result).length > 0 ? result : false;
}


// Set or get the innerHTML of a node
Object.prototype.html = function (s,r) {
  if (typeof s !== 'string') return !this.innerHTML ? false : this.innerHTML;
  if (r)  return this.innerHTML = this.innerHTML.replace(s,r);
  switch (s[0]){
    case '+':  return this.innerHTML += s.trim().slice(1); break;
    case '?':  return this.innerHTML; break;
    default:   return this.innerHTML = s.trim(); break;
  }
}
