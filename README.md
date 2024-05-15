# Not jQuery

Simplified node selection and attribute manipulation in plain Javascript. Minimal code. No dependecies. Looks like jQuery, but is absolutely not jQuery and *cannot* be used with jQuery.

<br>

## Functions

The `$()` function is effectively just `document.querySelectorAll()`, and will either return `null` if nothing was found, the node if there's a single match, or the entire nodeList if there are multiple matches.

<br>

The `ƒ()` function performs basic attribute manipulation on nodes / nodeLists. It is implicitly available as the second input of `$()`, but may be explicitly used with either `$()` or any other node / nodeList.

<br>

Implicit:
1. `$('#myId', '.myClass')`
2. `$('a', '.myClass')`

<br>

Explicit:
1. `$('#myId').ƒ('.myClass')`
2. `$('a').ƒ('.myClass')`
3. `document.getElementById('myId').ƒ('.myClass')`
4. `document.getElementsByTagName('a').ƒ('.myclass')`

<br>

The `ƒ()` function has four operators that may be prefixed to the input:
1. `+` adds the attribute(s)
2. `-` removes the attribute(s)
3. `±` toggles the attribute(s), default operation if none is specified
4. `?` gets the attribute(s)

<br>

While any `ƒ()` attribute may be `key="value"` specified, the `#` and `.` characters may be used to abbreviate id's and classes (as one would with the `$()` selector). The operation can be applied to multiple attributes, simultaneously.
1. `$('a', '+ .link')`
2. `$('.globe.icon', '+ title="Hello World" .navIcon')`

<br>

What the `?` operator returns may vary depending on what is query and what is found. This is enumerated in the code comments, [here](https://github.com/pxninja/not-jquery/blob/main/%24.js#L180).

<br>

## Prototypes

Four object prototypes are included that work with any node or nodeList:
1. `on()`
2. `off()`
3. `html()`

<br>

If you're familiar with `addEventListener` and `removeEventListener` then adopting `on` and `off` couldn't be easier. The meaningful benefit is that both `on` and `off` support nodeLists, aside from being more succinct.

<br>

For example...
1. `$('a').on('click', myFunc())`
2. `document.getElementById('myId').on('click', function(){...})`

<br>

The `html` prototype returns or modifies an element(s) innerHTML.
1. `$('#myId').html()` gets and returns the innerHTML of the "myId" element
2. `$('#myId').html('Hello')` sets the innerHTML of "myId" to "Hello"
3. `$('#myId').html('Hello', 'World')` replaces innerHTML "Hello" with "World"
