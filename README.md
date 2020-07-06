# @zendesk/babel-plugin-react-displayname

> Automatically generate display names for React components

## Install

Using npm:

```sh
npm install --save-dev @zendesk/babel-plugin-react-displayname
```

or using yarn:

```sh
yarn add @zendesk/babel-plugin-react-displayname --dev
```

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
