# Interaction >> Switch >> Overview ||10

A web component that is used to toggle a property or feature on or off. Toggling the component on or off should have immediate action and should not require pressing any additional buttons (submit) to confirm what just happened. Switch is not a Checkbox in disguise and should not be used as part of a form.

```js script
import { html } from '@lion/core';
import '@lion/switch/define-switch';
```

```js preview-story
export const main = () => html` <lion-switch label="Label" help-text="Help text"></lion-switch> `;
```

## Features

- Get or set the checked state (boolean) - `checked` boolean attribute
- Pre-select an option by setting the `checked` boolean attribute
- Get or set the value of the choice - `choiceValue()`

## Installation

```bash
npm i --save @lion/switch
```

```js
import { LionSwitch } from '@lion/switch';
// or
import '@lion/switch/define-switch';
```
