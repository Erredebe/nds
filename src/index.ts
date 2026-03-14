import { defineBox } from './components/box/index.js';
import { defineButton } from './components/button/index.js';
import { defineCard } from './components/card/index.js';
import { defineHeading } from './components/heading/index.js';
import { defineInput } from './components/input/index.js';
import { defineStack } from './components/stack/index.js';
import { defineText } from './components/text/index.js';
import { semanticTokens, setTheme, themes, tokens } from './foundation/index.js';
import { defineAlert } from './components/alert/index.js';
import type { DefineComponentOptions } from './foundation/registry.js';

export interface DefineAllComponentsConfig {
  box?: DefineComponentOptions;
  button?: DefineComponentOptions;
  card?: DefineComponentOptions;
  heading?: DefineComponentOptions;
  input?: DefineComponentOptions;
  stack?: DefineComponentOptions;
  text?: DefineComponentOptions;
  alert?: DefineComponentOptions;
}

export const defineAllComponents = (config: DefineAllComponentsConfig = {}): void => {
  defineBox(config.box);
  defineButton(config.button);
  defineCard(config.card);
  defineHeading(config.heading);
  defineInput(config.input);
  defineStack(config.stack);
  defineText(config.text);
  defineAlert(config.alert);
};

export { semanticTokens, setTheme, themes, tokens };
