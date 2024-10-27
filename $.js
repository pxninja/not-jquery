// $.js
// https://github.com/pxninja/not-jquery/
// 
// Copyright (c) 2024, Samuel Davidson
// Released under the MIT License
// https://github.com/pxninja/not-jquery/blob/main/LICENSE

export default (function() {

  // $election prototype
  Object.prototype.$ = function (selector, attributes) {
    return $election(selector, attributes)    
  }

  // ƒunction prototype
  Object.prototype.ƒ = function (string) {
    return ƒunction(this, string)
  }

  // Set or get the innerHTML of a node
  Object.prototype.html = function (find, replace) {
    return html(this, find, replace)
  }

  // Add listener
  Object.prototype.on = function (event, ƒunction) {
    toggleEventListener(this, event, ƒunction, 1)
    return this
  }

  // Remove listener
  Object.prototype.off = function (event, ƒunction) {
    toggleEventListener(this, event, ƒunction, 0)
    return this
  }

  // Placing logic outside prototypes reduces volume of exported code
  // ʕʘˬʘʔ

  const $election = (selector = window, attributes) => {
    // Enable array-like node selection, where $(0) is the <head>,
    // $(1) is the <body>, $(1,0) is the first <body> node, etc.
    if (isNumber(attributes)) attributes = String(attributes)
    if (isNumber(selector)) selector = getChildNode(getNode('html')[0], selector)

    // Select the specified node(s)
    if (isString(selector)) {
      let nodes = getNode(selector)
      selector = nodes.length === 0 ? null :
                 nodes.length === 1 ? nodes[0] :
                 nodes
    }
    return attributes ? selector.ƒ(attributes) : selector
  }

  const ƒunction = (nodes, string) => {
    // Treat numbers like a node index, akin to the $() prototype
    if (isNumber(string)) return getChildNode(nodes, string)

    // Exit if no object or string exist, or no string type
    if (!nodes || !string || isString(parseForInteger(string))) return nodes

    // If the first character specifies an operation, perform that operation,
    // otherwise toggle the inclusion / exclusion of a given attribute.
    string = trimString(string)
    let operator = string[0]
    let attributes = parseForAttrs(inString('?+-±', operator) ? sliceString(string) : string)

    if (operator === '?') {
      let result = []
      listOfNodes(nodes).forEach(element => result.push(evalAttrs(element, attributes)))
      return result.length > 1 ? result : result[0]
    } else {
      listOfNodes(nodes).forEach(element => addRemoveToggle(element, attributes, operator))
      return nodes
    }
  }

  const parseForInteger = (value) => {
    return parseInt(value)
  }

  const inString = (string, character) => {
    return string.includes(character)
  }

  const trimString = (string) => {
    return string.trim()
  }

  const sliceString = (string) => {
    return trimString(string).slice(1)
  }

  const isSameType = (a, b) => {
    return typeof a === b
  }

  const isNumber = (number) => {
    let integer = parseForInteger(number)
    return !isNaN(integer) && isSameType(i, 'number')
  }

  const isString = (string) => {
    return isSameType(string, 'string')
  }

  const attrIsClass = (string1, array, string2 = 'class') => {
    return !array
           ? string1 === string2 && !isString(array)
           : string1 === string2 && Array.isArray(array)
  }

  const instOf = (object, constructor = NodeList) => {
    return object instanceof constructor
  }

  const listOfNodes = (object) => {
    return instOf(object) ? object : [object]
  }

  const getNode = (selector) => {
    return document.querySelectorAll(selector)
  }

  const getChildNode = (node, number) => {
    let index = parseForInteger(number)
    return index < 0 ? node.children[node.children.length + index] : node.children[index]
  }

  const parseForAttrs = (string) => {
    // Matches: #idString    | .className   | key="v1" or key="v1 v2 v3 ..."   | key=val  | keyOnly
    let regex =/#([^\s#."']+)|\.([^\s#."']+)|([\w-]+)\s*=\s*(?:["']([^"']+)["']|([^"' ]+))|(\b[\w-]+\b)/g

    // Process matches
    let match; let result = {}
    while ((match = regex.exec(string)) !== null) {
      match[1] ? result.id = match[1] :
      match[2] ? result.class = [...(result.class || []), match[2]] : 
      match[3] ?
        attrIsClass(match[3]) && (match[4] || match[5]) ?
          result.class = (match[4] ?? match[5]).split(/\s+/) :
          result[match[3]] = match[4] ?? match[5] :
      match[6] ? result[match[6]] = '' : 
      undefined
    }
    return result
  }

  const keys = (object) => {
    return Object.keys(object)
  }

  const vals = (object) => {
    return Object.values(object)
  }

  const homogenous = (object, length) => {
    return (instOf(object, Object) ? vals(object) : object).every(value => value === true || (value === false && length > 1)) && length > 0
  }

  const attr = (element, key, value) => {
    return null != value  ? element.setAttribute(key, value) :
           value === null ? element.removeAttribute(key) :
           element.getAttribute(key)
  }

  const evalAttrs = (element, attributes) => {
    let result = {}

    // Immediately return if not an Element
    if (!instOf(element, Element)) return

    // Get all attributes if no specific query was made
    let ambiguous = keys(attributes).length === 0
    if (ambiguous) {
      for (let i = 0; i < element.attributes.length; i++) {
        result[element.attributes[i].name] = element.attributes[i].value
      }

    // Otherwise get only the queried attributes
    } else {
      for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          let value = attributes[key]

          // When it's a class...
          if (attrIsClass(key, value)) {
            value.forEach(className => result.class = [...(result.class || []), element.classList.contains(className)])
            result.class = homogenous(result.class, 1)
            continue
          }

          // Get the attributes value when no query value is available to compare
          // let elemValue = element.getAttribute(key)
          let elemValue = attr(element, key)
          if (!value) {
            result[key] = elemValue ?? undefined
            continue
          }

          // Otherwise compare the query and attribute values
          result[key] = elemValue ? value === elemValue : false
        }
      }
    }

    // Return the most salient result
    let val = vals(result)
    let valLen = val.length
    return !ambiguous && valLen === 1 ? result[val[0]] :
           homogenous(result, valLen) ? result[val[0]] :
           valLen > 0 ? result :
           undefined
  }

  const addRemoveToggle = (element, attributes, operation) => {
    // For each element attribute...
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        let value = attributes[key]
        // When it's a class...
        attrIsClass(key, value)
        ? value.forEach(className => {
            let list = element.classList
            operation === '+' ? list.add(className) :
            operation === '-' ? list.remove(className) :
            list.toggle(className)
            })

        // All others...
        : operation === '+' ? attr(element, key, value) :
          operation === '-' ? attr(element, key, null) :
          attr(element, key) === value
          ? attr(element, key, null)
          : attr(element, key, value)
      }
    }
  }

  const getHTML = (element) => {
    return element.innerHTML
  }

  const setHTML = (element, newValue) => {
    return element.innerHTML = newValue
  }

  const addHTML = (element, newValue, prepend) => {
    let newString = sliceString(newValue)
    let oldString = getHTML(element)
    return setHTML(element, prepend ? newString + oldString : oldString + newString)
  }

  const replaceHTML = (element, find, replace) => {
    return setHTML(element, getHTML(element).replace(find, replace))
  }

  const html = (element = document.documentElement, find, replace) => {
    return !isString(find) && !instOf(find, RegExp)
            ? getHTML(element) ?? false
            : isString(replace) || instOf(find, RegExp)
              ? replaceHTML(element, find, replace || '')
              : inString('<+', find[0]) ? addHTML(element, find)
              : find[0] === '>' ? addHTML(element, find, true)
              : find[0] === '-' ? replaceHTML(element, find, '')
              : setHTML(element, trimString(find))
  }

  const toggleEventListener = (object = window, event, ƒunction, oı) => {
    listOfNodes(object).forEach(element => {
      oı > 0
      ? element.addEventListener(event, ƒunction)
      : element.removeEventListener(event, ƒunction)
    })
  }
})()
