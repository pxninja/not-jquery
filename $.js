// $.js
// https://github.com/pxninja/not-jquery/
// 
// Copyright (c) 2024, Samuel Davidson
// Released under the MIT License
// https://github.com/pxninja/not-jquery/blob/main/LICENSE


//-- SELECTOR PROTOTYPE --//

// This prototype simplifies node selection in a jQuery-like fashion, dependency free.
// Looks like jQuery, but is absolutely not jQuery and cannot be used with jQuery.

// Ex: $('#myId')
// Ex: $('#myId','.show')

Object.prototype.$ = function (selector = window, attributes) {

  // Allow for array-like node selection, where $(0) is the <head>,
  // $(1) is the <body>, $(1, 0) is the first <body> node, etc.
  if ($ƒ.isNumber(attributes)) attributes = String(attributes)
  if ($ƒ.isNumber(selector)) selector = $ƒ.getChildNode($ƒ.getNode('html')[0], selector)

  // Select the specified node(s)
  if ($ƒ.isString(selector)) {
    let nodes = $ƒ.getNode(selector)
    selector = nodes.length === 0 ? null :
               nodes.length === 1 ? nodes[0] :
               nodes
  }
  return attributes ? selector.ƒ(attributes) : selector
}

// -- ATTRIBUTE MANIPULATION PROTOTYPE -- //

// Can be used in conjunction with, or independent of, the $ prototype.
// Ex: $('body', '.show') === $('body').ƒ('.show') === document.querySelectorAll('body')[0].ƒ('.show')

Object.prototype.ƒ = function (string) {

  // If the string is actually a number, treat it like an index
  // and return the corresponding node, where 'obj.ƒ(0)'
  // is the first node, 'obj.ƒ(-1)'' is the last, etc.

  if ($ƒ.isNumber(string)) {
    return $ƒ.getChildNode(this, string)
  }

  // Exit if no object or string exist, or if the string is not a 'string'
  if (!this || !string || $ƒ.isString($ƒ.stringToInteger(string))) return this

  // If the first character specifies an operation, perform that operation,
  // otherwise toggle the inclusion / exclusion of a given attribute.
  string = string.trim()
  let operator = string[0]
  let attributes = $ƒ.parseForAttrs('?+-±'.includes(operator) ? string.slice(1, string.length) : string)
  return operator === '?'
         ? $ƒ.getAttrs(this, attributes)
         : $ƒ.updateAttrs(this, attributes, operator)
}


//-- OTHER OBJECT PROTOTYPES --//

// These are very similar to the regular JS event listener declarations,
// but more succinct and capable of looping through a node list.

// Add listener
Object.prototype.on = function (type, func) {
  $ƒ.eventListener(this, 1, type, func)
  return this
}

// Remove listener
Object.prototype.off = function (type, func) {
  $ƒ.eventListener(this, 0, type, func)
  return this
}

// Set or get the innerHTML of a node
Object.prototype.html = function (find, replace) {
  return $ƒ.innerHTML(this, find, replace)
}


//-- HELPERS --//

// These methods are used by the prototypes. Moving this logic
// outside their definitions helps improve minification, and
// reduces the volume of exported code (only code directly
// defined in a prototype is exported).
// ʕʘˬʘʔ

// $elector ƒunctions
const $ƒ = {

  noop: () => {
    return undefined
  },

  stringToInteger: (val) => {
    return parseInt(val)
  },

  isNumber: (val) => {
    let i = $ƒ.stringToInteger(val)
    return !isNaN(i) && typeof i === 'number'
  },

  isString: (val) => {
    return typeof val === 'string'
  },

  getNode: (selector) => {
    return document.querySelectorAll(selector)
  },

  getChildNode: (node, num) => {
    let i = $ƒ.stringToInteger(num)
    return i < 0 ? node.children[node.children.length + i] : node.children[i]
  },

  eventListener: (obj = window, task, type, func) => {
    let elems = obj instanceof NodeList ? obj : [obj]
    task > 0
      ? elems.forEach(elem => elem.addEventListener(type, func))
      : elems.forEach(elem => elem.removeEventListener(type, func))
  },

  innerHTML: (elem = document.documentElement, find, replace) => {
    if (!$ƒ.isString(find)) return !elem.innerHTML ? false : elem.innerHTML
    if ($ƒ.isString(replace)) return elem.innerHTML = elem.innerHTML.replace(find, replace)
    return find[0] === '+' ? elem.innerHTML += find.trim().slice(1) :
           find[0] === '-' ? elem.innerHTML :
           elem.innerHTML = find.trim()
  },

  parseForAttrs: (string) => {
    // Matches: #idString    | .className   | key="v1" or key="v1 v2 v3 ..."   | key=val  | keyOnly
    let regex =/#([^\s#."']+)|\.([^\s#."']+)|([\w-]+)\s*=\s*(?:["']([^"']+)["']|([^"' ]+))|(\b[\w-]+\b)/g

    // Process matches
    let match; let result = {}
    while ((match = regex.exec(string)) !== null) {
      match[1] ? result.id = match[1] :
      match[2] ? result.class = [...(result.class || []), match[2]] : 
      match[3] ?
        match[3] === 'class' && (match[4] || match[5]) ?
          result.class = (match[4] ?? match[5]).split(/\s+/) :
          result[match[3]] = match[4] ?? match[5] :
      match[6] ? result[match[6]] = '' : 
      $ƒ.noop()
    }
    return result
  },

  evalAttr: (element, attributes) => {
    let result = {}

    // Immediately return if 'element' is not an Element
    if (!(element instanceof Element)) return

    // If no specific query was made, get all attributes
    let ambiguous = Object.keys(attributes).length === 0
    if (ambiguous) {
      for (let i = 0; i < element.attributes.length; i++) {
        result[element.attributes[i].name] = element.attributes[i].value
      }

    // Otherwise get only the queried attributes
    } else {
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          let value = attributes[key]

          // If querying for classes...
          if (key === 'class' && Array.isArray(value)) {
            value.forEach(className => result.class = [...(result.class || []), element.classList.contains(className)])
            result.class = result.class.every(boolean => boolean === true)
            continue
          }

          // Get the attributes value when no query value is available to compare
          let elemValue = element.getAttribute(key)
          if (!value) {
            result[key] = elemValue ?? $ƒ.noop()
            continue
          }
          // Otherwise compare the query and attribute values
          result[key] = elemValue ? value === elemValue : false
        }
      }
    }

    // Return the most salient result
    return !ambiguous && Object.keys(result).length === 1 ? result[Object.keys(result)[0]] :
           Object.values(result).every(value => value === true)  ? true :
           Object.values(result).every(value => value === false) ? false :
           result ?? $ƒ.noop()
  },

  getAttrs: (This, attributes) => {
    let result = []
    let elements = This instanceof NodeList ? This : [nodes]
    elements.forEach(element => result.push($ƒ.evalAttr(element, attributes)))
    return result.length > 1 ? result : result[0]
  },

  addRemoveToggle: (element, attributes, operation) => {
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        let value = attributes[key]
        key === 'class' && Array.isArray(value)
        ? operation == '+' ? value.forEach(className => element.classList.add(className)) :
          operation == '-' ? value.forEach(className => element.classList.remove(className)) :
          value.forEach(className => element.classList.toggle(className))
        : operation === '+' ? element.setAttribute(key, value) :
          operation === '-' ? element.removeAttribute(key, value) :
          element.getAttribute(key) === value ? element.removeAttribute(key) : element.setAttribute(key, value)
      }
    }
  },

  updateAttrs: (This, attributes, operation) => {
    let elements = This instanceof NodeList ? This : [This]
    elements.forEach(element => $ƒ.addRemoveToggle(element, attributes, operation))
    return This
  }
}

export default { $, ƒ, on, off, html }
