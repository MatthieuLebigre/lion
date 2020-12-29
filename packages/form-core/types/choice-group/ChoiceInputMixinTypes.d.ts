import { Constructor } from '@open-wc/dedupe-mixin';
import { LitElement, TemplateResult } from '@lion/core';
import { CSSResultArray } from 'lit-element';
import { FormatHost } from '../FormatMixinTypes';

export interface ChoiceInputModelValue {
  checked: boolean;
  value: any;
}

/** TODO: legacy code: serialization should happen on choice-group level */
export interface ChoiceInputSerializedValue {
  checked: boolean;
  value: string;
}

export declare class ChoiceInputHost {
  modelValue: ChoiceInputModelValue;
  serializedValue: ChoiceInputSerializedValue;

  checked: boolean;

  get choiceValue(): any;

  set choiceValue(value: any);

  protected requestUpdateInternal(name: string, oldValue: any): void;

  firstUpdated(changedProperties: Map<string, any>): void;

  updated(changedProperties: Map<string, any>): void;

  static get styles(): CSSResultArray;

  render(): TemplateResult;

  _choiceGraphicTemplate(): TemplateResult;

  connectedCallback(): void;
  disconnectedCallback(): void;

  __toggleChecked(ev: Event): void;

  __syncModelCheckedToChecked(checked: boolean): void;

  __syncCheckedToModel(checked: boolean): void;

  __syncCheckedToInputElement(): void;

  _proxyInputEvent(): void;

  _onModelValueChanged(
    newV: { modelValue: ChoiceInputModelValue },
    oldV: { modelValue: ChoiceInputModelValue },
  ): void;

  parser(): any;

  formatter(modelValue: ChoiceInputModelValue): string;

  _isEmpty(): void;

  _syncValueUpwards(): void;

  type: string;

  _inputNode: HTMLElement;
}

export declare function ChoiceInputImplementation<T extends Constructor<LitElement>>(
  superclass: T,
): T &
  Constructor<ChoiceInputHost> &
  ChoiceInputHost &
  Constructor<FormatHost> &
  FormatHost &
  HTMLElement;

export type ChoiceInputMixin = typeof ChoiceInputImplementation;
