// $.js
// https://github.com/pxninja/not-jquery/
// 
// Copyright (c) 2024, Samuel Davidson
// Released under the MIT License
// https://github.com/pxninja/not-jquery/blob/main/LICENSE

//-- SELECTOR PROTOTYPE --//

// This simplifies node selection in a jQuery-like fashion, dependency free.
// Looks like jQuery, but is absolutely not jQuery and cannot be used with jQuery.

// Ex: $('#myId')
// Ex: $('#myId','.show')

Object.prototype.$ = function (selector = window, attributes) {

  // Allow for array-like node selection, where $(0) is the <head>,
  // $(1) is the <body>, $(1, 0) is the first <body> node, etc.
  if ($_isNum(attributes)) attributes = String(attributes)
  if ($_isNum(selector)) selector = $_child(document.querySelectorAll('html')[0], selector)

  // Select the specified node(s)
  if ($_isStr(selector)) {
    let nodes = document.querySelectorAll(selector)
    switch (nodes.length) {
      case 0 : selector = null;     break
      case 1 : selector = nodes[0]; break
      default: selector = nodes;    break
    }
  }
  return !attributes ? selector : selector.ƒ(attributes)
}

// -- ATTRIBUTE MANIPULATION PROTOTYPE -- //

// The 'ƒ' character was used to help avoid namespace collisions.
// If you change the name of the prototype, also change it in
// the return line of the $() selector function.

Object.prototype.ƒ = function (string) {

  // If the string is actually a number, treat it like an index
  // and return the corresponding node, where 'obj.ƒ(0)'
  // is the first node, 'obj.ƒ(-1)'' is the last, etc.

  if ($_isNum(string)) {
    return $_child(this, string)
  }


  // It's important the number check occurs first, because '0' is
  // both a 'number' and 'false', making '!0' return as 'true'.
  // If the string was '0',  then '!string' would return 'true',
  // which would trigger the following statement and the
  // number evaluation would never occur.

  // Exit if no object or string exist, or if the string is not a 'string'
  if (!this || !string || $_isStr(parseInt(string))) return this;


  // Because the first / last string characters are evaluated as operators,
  // leading / trailing white space needs to be removed.

  // Trim off leading / trailing white space
  string = string.trim()


  // Set which characters will be evaluated as operation symbols.
  let operator = {
    0: '±+-?',                    // Toggle, Add, Remove, Get
    1: string[0],                 // First character of string
    2: string[string.length - 1], // Last character of string
    3: string[string.length - 2]  // Second-to-last character
  }


  // Putting the operator at the beginning of the string is a best practice.
  // Ex: obj.ƒ('+ .myClass')

  // Check if the first character is an operator.
  if (operator[0].includes(operator[1])) return ƒ_doSomething.bind(this)(operator[1], 1, string.length)


  // Because '-' can be a valid string part, if the operator is
  // placed at the end of the string, it must be separated
  // from the string by a space. For example, because
  // 'myClass-' is a valid class, it would need to be
  // 'myClass -' to be removed.
  // Ex: obj.ƒ('.myClass -') => removes 'myClass'
  // Ex: obj.ƒ('.myClass-')  => toggles 'myClass-'

  // Check if the last character is an operator preceded by a space.
  if (operator[0].includes(operator[2]) && operator[3] === ' ') return ƒ_doSomething.bind(this)(operator[2], 0, -1)


  // If no operator was specified, toggle the inclusion / exclusion
  // of the specified attribute(s).
  return ƒ_modify.bind(this)(ƒ_parse(string), '±')
  

  // Helper function to execute a specific operation.
  // o - the operation to execute
  // a - starting index of slice
  // b - ending index of slice
  function ƒ_doSomething (o,a,b) {

    // Parse the string for attribute(s)
    let s = ƒ_parse(string.slice(a,b))
    
    // Check if GET is the intention
    if (o === '?') return ƒ_get.bind(this)(s)
    
    // Otherwise MODIFY the attribute(s)
    return ƒ_modify.bind(this)(s, o)
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
  function ƒ_parse (string) {
    let result = {}
    let regex = /#([^\s#."']+)|\.([^\s#."']+)|([\w-]+)\s*=\s*["']([^"']+)["']|(\b[\w-]+\b)/g
    let match
    
    while ((match = regex.exec(string)) !== null) {
      if (match[1]) result.id = match[1]
      else if (match[2]) result.class = [...(result.class || []), match[2]]
      else if (match[3] && match[4]) {
        if (match[3] === 'class') result.class = match[4].split(/\s+/)
        else result[match[3]] = match[4]
      }
      else if (match[5]) result[match[5]] = ''
    }
    return result
  }

  // MODIFY the element(s)
  // Any attribute value can be set with a 'key="val"' pattern.
  // Any attribute value can be removed with only the 'key'.
  // Classes and id's can be referenced with symbols.
  // Multiple attributes may be added/removed/toggled simultaneously.
  // Only one operation is executed.
  // NodeLists are supported.
  function ƒ_modify (attributes, operation) {
    let elements = this instanceof NodeList ? this : [this]
    elements.forEach(element => ƒ_art(element, attributes, operation))
    return this
  }

  // ADD / REMOVE / TOGGLE the attribute(s)
  function ƒ_art (element, attributes, operation) {
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        let value = attributes[key]
        if (key === 'class') {
          switch (operation) {
            case '+': value.forEach(className => element.classList.add(className));    break
            case '-': value.forEach(className => element.classList.remove(className)); break
            case '±': value.forEach(className => element.classList.toggle(className)); break
          }
        } else {
          switch (operation) {
            case '+': element.setAttribute(key, value);    break
            case '-': element.removeAttribute(key, value); break
            case '±': element.getAttribute(key) === value ? element.removeAttribute(key) : element.setAttribute(key, value); break
          }
        }
      }
    }
  }
  
  // GET attribute(s)

  // Returns a single bool when a specific attribute value is queried, where true
  // is when the queried value matches the atrribute value.
  // Ex: obj.ƒ('? #myId') => bool
  // Ex: obj.ƒ('? id="myId"') => bool

  // Specific to classes, returns a single bool representing the existence of,
  // and not the order of, all queried classes, where true is when all the
  // queried values exist, and false is when at least one does not,
  // agnostic of query order.
  // Ex: obj.ƒ('? .one') => bool - true for class="one two" and class="two one"
  // Ex: obj.ƒ('? .one .two') => bool - true for class="one two" and class="two one"
  // Ex: obj.ƒ('? .one .two') => bool - false for class="one" and class="two"

  // Returns an attributes value when an attributes name is queried and
  // the attribute value exists.
  // Ex: obj.ƒ('? id') => 'myId'
  // Ex: obj.ƒ('? class') => 'classOne classTwo'

  // If an attribute exists with no value, an empty string is returned.
  // Ex: obj.ƒ('? disabled') => ''

  // Returns 'undefined' when an attribute name is queried and the
  // attribute name is absent.
  // Ex: obj.ƒ('? disabled') => undefined

  // Returns a key-value object when more than one attribute name is queried.
  // Ex: obj.ƒ('? id class') => {id: 'myId', class: 'classOne classTwo'}

  // Returns a key-value object of all attributes when no specific
  // attribute is queried.
  // Ex: obj.ƒ('?') => {width: '640', height: '480'}

  // And if the operation is performed on a NodeList, results are
  // returned in an array.
  // Ex: nodes.ƒ('? class') => ['classOne classTwo', 'classThree classFour']
  // Ex: nodes.ƒ('?') [{...}, {...}]
  
  function ƒ_get (attributes) {
    let result = []
    let elements = this instanceof NodeList ? this : [this]
    elements.forEach(element => result.push(ƒ_eval(element, attributes)))
    return result.length > 1 ? result : result[0]
  }

  // EVALUATE attribute(s)
  // A helper function containing the core ƒ_get() logic.
  function ƒ_eval (element, attributes) {
    let result = {}

    // Immediately return if 'element' is not an Element
    if (!(element instanceof Element)) return

    // If no specific query was made, get all attributes
    if (Object.keys(attributes).length === 0) {
      for (let i = 0; i < element.attributes.length; i++) {
        result[element.attributes[i].name] = element.attributes[i].value
      }

    // Otherwise get only the queried attributes
    } else {
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          let value = attributes[key]

          // If querying for classes…
          if (key === 'class' && Array.isArray(value)) {
            value.forEach(className => result.class = [...(result.class || []), element.classList.contains(className)])
            result.class = result.class.every(boolean => boolean === true)
            continue
          }

          let elemValue = element.getAttribute(key)

          // Get the attributes value when no query value is available to compare
          if (!value) {
            result[key] = elemValue ?? undefined
            continue
          }

          // Otherwise compare the query and attribute values
          result[key] = elemValue ? value === elemValue : undefined
        }
      }
    }

    // Return the most salient result
    switch (Object.keys(result).length) {
      case 0 : return undefined; break
      case 1 : return result[Object.keys(result)[0]]; break
      default: return result; break

    }
  }
}


//-- OTHER OBJECT PROTOTYPES --//

// These are identical with the regular JS event listener
// declarations, just more succinct with the capability
// of looping through a node list.

// Add listener
Object.prototype.on = function (type, func) {
  $_eventListener(this, 0, type, func)
  return this
}

// Remove listener
Object.prototype.off = function (type, func) {
  $_eventListener(this, 1, type, func)
  return this
}

// Set or get the innerHTML of a node
Object.prototype.html = function (find, replace) {
  return $_innerHTML(this, find, replace)
}


//-- HELPER FUNCTIONS --//

function $_isNum(val) {
  let i = parseInt(val)
  return !isNaN(i) && typeof i === 'number'
}

function $_isStr(val) {
  return typeof val === 'string'
}

function $_child(node, i) {
  i = parseInt(i)
  return i < 0 ? node.children[node.children.length + i] : node.children[i]
}

function $_getNodeList (obj) {
  return obj instanceof NodeList ? obj : [obj]
}

function $_eventListener (obj = window, task, type, func) {
  let elems = $_getNodeList(obj)
  switch (task) {
    case 0 : elems.forEach(elem => elem.addEventListener(type, func));    break
    case 1 : elems.forEach(elem => elem.removeEventListener(type, func)); break
    default: break
  }
}

function $_innerHTML (elem = document.documentElement, find, replace) {
  if ($_isStr(find)) return !elem.innerHTML ? false : elem.innerHTML
  if (replace) return elem.innerHTML = elem.innerHTML.replace(find, replace)
  switch (find[0]){
    case '+':  return elem.innerHTML += find.trim().slice(1); break
    case '?':  return elem.innerHTML; break
    default:   return elem.innerHTML = find.trim(); break
  }
}

export default { $, ƒ, on, off, html }
