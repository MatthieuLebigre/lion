/* eslint-disable class-methods-use-this */

import { css, html, nothing, dedupeMixin } from '@lion/core';
import { FormatMixin } from '../FormatMixin.js';

/**
 * @typedef {import('../../types/FormControlMixinTypes').FormControlHost} FormControlHost
 * @typedef {FormControlHost & HTMLElement & {__parentFormGroup?:HTMLElement, checked?:boolean}} FormControl
 * @typedef {import('../../types/choice-group/ChoiceInputMixinTypes').ChoiceInputMixin} ChoiceInputMixin
 * @typedef {import('../../types/choice-group/ChoiceInputMixinTypes').ChoiceInputModelValue} ChoiceInputModelValue
 */

/**
 * @param {ChoiceInputModelValue} nw\
 * @param {{value?:any, checked?:boolean}} old
 */
const hasChanged = (nw, old = {}) => nw.value !== old.value || nw.checked !== old.checked;

/**
 * @type {ChoiceInputMixin}
 * @param {import('@open-wc/dedupe-mixin').Constructor<import('@lion/core').LitElement>} superclass
 */
const ChoiceInputMixinImplementation = superclass =>
  // @ts-expect-error false positive for incompatible static get properties. Lit-element merges super properties already for you.
  class ChoiceInputMixin extends FormatMixin(superclass) {
    static get properties() {
      return {
        /**
         * Boolean indicating whether or not this element is checked by the end user.
         */
        checked: {
          type: Boolean,
          reflect: true,
        },
        /**
         * Boolean indicating whether or not this element is disabled.
         */
        disabled: {
          type: Boolean,
          reflect: true,
        },
        /**
         * Whereas 'normal' `.modelValue`s usually store a complex/typed version
         * of a view value, choice inputs have a slightly different approach.
         * In order to remain their Single Source of Truth characteristic, choice inputs
         * store both the value and 'checkedness', in the format { value: 'x', checked: true }
         * Different from the platform, this also allows to serialize the 'non checkedness',
         * allowing to restore form state easily and inform the server about unchecked options.
         */
        modelValue: {
          type: Object,
          hasChanged,
        },
        /**
         * The value property of the modelValue. It provides an easy interface for storing
         * (complex) values in the modelValue
         */
        choiceValue: {
          type: Object,
        },
      };
    }

    get choiceValue() {
      return this.modelValue.value;
    }

    set choiceValue(value) {
      this.requestUpdate('choiceValue', this.choiceValue);
      if (this.modelValue.value !== value) {
        /** @type {ChoiceInputModelValue} */
        this.modelValue = { value, checked: this.modelValue.checked };
      }
    }

    /**
     * @param {string} name
     * @param {any} oldValue
     */
    requestUpdateInternal(name, oldValue) {
      super.requestUpdateInternal(name, oldValue);

      if (name === 'modelValue') {
        if (this.modelValue.checked !== this.checked) {
          this.__syncModelCheckedToChecked(this.modelValue.checked);
        }
      } else if (name === 'checked') {
        if (this.modelValue.checked !== this.checked) {
          this.__syncCheckedToModel(this.checked);
        }
      }
    }

    /**
     * @param {import('lit-element').PropertyValues } changedProperties
     */
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      if (changedProperties.has('checked')) {
        // Here we set the initial value for our [slot=input] content,
        // which has been set by our SlotMixin
        this.__syncCheckedToInputElement();
      }
    }

    /**
     * @param {import('lit-element').PropertyValues } changedProperties
     */
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('modelValue')) {
        this.__syncCheckedToInputElement();
      }

      if (
        changedProperties.has('name') &&
        // @ts-expect-error not all choice inputs have a parent form group, since this mixin does not have a strict contract with the registration system
        this.__parentFormGroup &&
        // @ts-expect-error
        this.__parentFormGroup.name !== this.name
      ) {
        // @ts-expect-error not all choice inputs have a name prop, because this mixin does not have a strict contract with form control mixin
        this.name = changedProperties.get('name');
      }
    }

    constructor() {
      super();
      this.modelValue = { value: '', checked: false };
      this.disabled = false;
      this.__toggleChecked = this.__toggleChecked.bind(this);
    }

    /**
     * Styles for [input=radio] and [input=checkbox] wrappers.
     * For [role=option] extensions, please override completely
     */
    static get styles() {
      const superCtor = /** @type {typeof import('@lion/core').LitElement} */ (super.prototype
        .constructor);
      return [
        superCtor.styles ? superCtor.styles : [],
        css`
          :host {
            display: flex;
            flex-wrap: wrap;
          }

          :host([hidden]) {
            display: none;
          }

          .choice-field__graphic-container {
            display: none;
          }
          .choice-field__help-text {
            display: block;
            flex-basis: 100%;
          }
        `,
      ];
    }

    /**
     * Template for [input=radio] and [input=checkbox] wrappers.
     * For [role=option] extensions, please override completely
     */
    render() {
      return html`
        <slot name="input"></slot>
        <div class="choice-field__graphic-container">${this._choiceGraphicTemplate()}</div>
        <div class="choice-field__label">
          <slot name="label"></slot>
        </div>
        <small class="choice-field__help-text">
          <slot name="help-text"></slot>
        </small>
        ${this._afterTemplate()}
      `;
    }

    _choiceGraphicTemplate() {
      return nothing;
    }

    _afterTemplate() {
      return nothing;
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('user-input-changed', this.__toggleChecked);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('user-input-changed', this.__toggleChecked);
    }

    /** @param {Event} ev */
    // eslint-disable-next-line no-unused-vars
    __toggleChecked(ev) {
      if (this.disabled) {
        return;
      }
      this.checked = !this.checked;
    }

    /**
     * @param {boolean} checked
     */
    __syncModelCheckedToChecked(checked) {
      this.checked = checked;
    }

    /**
     * @param {any} checked
     */
    __syncCheckedToModel(checked) {
      this.modelValue = { value: this.choiceValue, checked };
    }

    __syncCheckedToInputElement() {
      // ._inputNode might not be available yet(slot content)
      // or at all (no reliance on platform construct, in case of [role=option])
      if (this._inputNode) {
        /** @type {HTMLInputElement} */
        (this._inputNode).checked = this.checked;
      }
    }

    /**
     * @override
     * This method is overridden from FormatMixin. It originally fired the normalizing
     * 'user-input-changed' event after listening to the native 'input' event.
     * However on Chrome on Mac whenever you use the keyboard
     * it fires the input AND change event. Other Browsers only fires the change event.
     * Therefore we disable the input event here.
     */
    _proxyInputEvent() {}

    /**
     * @override
     * hasChanged is designed for async (updated) callback, also check for sync
     * (requestUpdateInternal) callback
     * @param {{ modelValue:unknown }} newV
     * @param {{ modelValue:unknown }} [oldV]
     */
    // @ts-expect-error
    _onModelValueChanged({ modelValue }, { modelValue: old }) {
      // @ts-expect-error
      if (this.constructor._classProperties.get('modelValue').hasChanged(modelValue, old)) {
        super._onModelValueChanged({ modelValue });
      }
    }

    /**
     * @override
     * Overridden from FormatMixin, since a different modelValue is used for choice inputs.
     * Sets modelValue based on checked state (instead of value), so that changes will be detected.
     */
    parser() {
      return this.modelValue;
    }

    /**
     * @override Overridden from FormatMixin, since a different modelValue is used for choice inputs.
     * @param {ChoiceInputModelValue } modelValue
     */
    formatter(modelValue) {
      return modelValue && modelValue.value !== undefined ? modelValue.value : modelValue;
    }

    /**
     * @override
     * Overridden from LionField, since the modelValue should not be cleared.
     */
    clear() {
      this.checked = false;
    }

    /**
     * Used for required validator.
     */
    _isEmpty() {
      return !this.checked;
    }

    /**
     * @override
     * Overridden from FormatMixin, since a different modelValue is used for choice inputs.
     * Synchronization from user input is already arranged in this Mixin.
     */
    _syncValueUpwards() {}
  };

export const ChoiceInputMixin = dedupeMixin(ChoiceInputMixinImplementation);
