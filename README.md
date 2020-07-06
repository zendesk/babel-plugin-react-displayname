# @zendesk/babel-plugin-react-displayname

> Automatically generate display names for React components

## Why use this?

React dev tools infer component names from the name of the function or class that defines the component. However, it does not work when anonymous functions are used.

This plugin fixes that by automatically generating the [displayName](https://reactjs.org/docs/react-component.html#displayname) property for assigned anonymous functions.

## What does it do?

This plugin converts the following:

```js
const Linebreak = React.memo(() => {
    return <br/>;
});

const Img = function () {
    return <img/>;
}
```

into:

```js
const Linebreak = React.memo(function _Linebreak() {
  return <br />;
});
Linebreak.displayName = "Linebreak";

const Img = function () {
  return <img />;
};
Img.displayName = "Img";
```

## Install

Using npm:

```sh
npm install --save-dev @zendesk/babel-plugin-react-displayname
```

or using yarn:

```sh
yarn add @zendesk/babel-plugin-react-displayname --dev
```

## Usage

### With a configuration file (Recommended)

Without options:
```json
{
  "plugins": ["@zendesk/babel-plugin-react-displayname"]
}
```

With options:
```json
{
  "plugins": ["@zendesk/babel-plugin-react-displayname", {
    "allowedCallees": {
      "react": ["createComponent"]
    }
  }]
}
```

## Options

### `allowedCallees`

`Object.<string, string[]>`, defaults to `{ "react": ["createContext"] }`

Enables generation of displayNames for certain called functions.

#### Example

By default, with `allowedCallees` set to `{ "react": ["createContext"] }`:

```js
import React, { createContext } from 'react';
const FeatureContext = createContext();
const AnotherContext = React.createContext();
```

is transformed into:

```js
import React, { createContext } from 'react';
const FeatureContext = createContext();
FeatureContext.displayName = "FeatureContext";
const AnotherContext = React.createContext();
AnotherContext.displayName = "AnotherContext";
```
