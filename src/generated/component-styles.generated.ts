import * as alertStyles from './components/alert/styles.generated.js';
import * as badgeStyles from './components/badge/styles.generated.js';
import * as boxStyles from './components/box/styles.generated.js';
import * as buttonStyles from './components/button/styles.generated.js';
import * as cardStyles from './components/card/styles.generated.js';
import * as checkboxStyles from './components/checkbox/styles.generated.js';
import * as dialogStyles from './components/dialog/styles.generated.js';
import * as fieldStyles from './components/field/styles.generated.js';
import * as headingStyles from './components/heading/styles.generated.js';
import * as inputStyles from './components/input/styles.generated.js';
import * as radioGroupStyles from './components/radio-group/styles.generated.js';
import * as selectStyles from './components/select/styles.generated.js';
import * as stackStyles from './components/stack/styles.generated.js';
import * as textStyles from './components/text/styles.generated.js';
import * as textareaStyles from './components/textarea/styles.generated.js';

export interface GeneratedComponentStyleEntry {
  tagName: string;
  stylePath: string;
  shadowStyles: string;
  lightStyles: string;
}

export const generatedComponentStyles: Record<string, GeneratedComponentStyleEntry> = {
  'nds-alert': { lightStyles: alertStyles.lightStyles, shadowStyles: alertStyles.shadowStyles, stylePath: 'src/components/alert/styles.css', tagName: 'nds-alert' },
  'nds-badge': { lightStyles: badgeStyles.lightStyles, shadowStyles: badgeStyles.shadowStyles, stylePath: 'src/components/badge/styles.css', tagName: 'nds-badge' },
  'nds-box': { lightStyles: boxStyles.lightStyles, shadowStyles: boxStyles.shadowStyles, stylePath: 'src/components/box/styles.css', tagName: 'nds-box' },
  'nds-button': { lightStyles: buttonStyles.lightStyles, shadowStyles: buttonStyles.shadowStyles, stylePath: 'src/components/button/styles.css', tagName: 'nds-button' },
  'nds-card': { lightStyles: cardStyles.lightStyles, shadowStyles: cardStyles.shadowStyles, stylePath: 'src/components/card/styles.css', tagName: 'nds-card' },
  'nds-checkbox': { lightStyles: checkboxStyles.lightStyles, shadowStyles: checkboxStyles.shadowStyles, stylePath: 'src/components/checkbox/styles.css', tagName: 'nds-checkbox' },
  'nds-dialog': { lightStyles: dialogStyles.lightStyles, shadowStyles: dialogStyles.shadowStyles, stylePath: 'src/components/dialog/styles.css', tagName: 'nds-dialog' },
  'nds-field': { lightStyles: fieldStyles.lightStyles, shadowStyles: fieldStyles.shadowStyles, stylePath: 'src/components/field/styles.css', tagName: 'nds-field' },
  'nds-heading': { lightStyles: headingStyles.lightStyles, shadowStyles: headingStyles.shadowStyles, stylePath: 'src/components/heading/styles.css', tagName: 'nds-heading' },
  'nds-input': { lightStyles: inputStyles.lightStyles, shadowStyles: inputStyles.shadowStyles, stylePath: 'src/components/input/styles.css', tagName: 'nds-input' },
  'nds-radio-group': { lightStyles: radioGroupStyles.lightStyles, shadowStyles: radioGroupStyles.shadowStyles, stylePath: 'src/components/radio-group/styles.css', tagName: 'nds-radio-group' },
  'nds-select': { lightStyles: selectStyles.lightStyles, shadowStyles: selectStyles.shadowStyles, stylePath: 'src/components/select/styles.css', tagName: 'nds-select' },
  'nds-stack': { lightStyles: stackStyles.lightStyles, shadowStyles: stackStyles.shadowStyles, stylePath: 'src/components/stack/styles.css', tagName: 'nds-stack' },
  'nds-text': { lightStyles: textStyles.lightStyles, shadowStyles: textStyles.shadowStyles, stylePath: 'src/components/text/styles.css', tagName: 'nds-text' },
  'nds-textarea': { lightStyles: textareaStyles.lightStyles, shadowStyles: textareaStyles.shadowStyles, stylePath: 'src/components/textarea/styles.css', tagName: 'nds-textarea' }
};

export const generatedLightStyles = [
  alertStyles.lightStyles,
  badgeStyles.lightStyles,
  boxStyles.lightStyles,
  buttonStyles.lightStyles,
  cardStyles.lightStyles,
  checkboxStyles.lightStyles,
  dialogStyles.lightStyles,
  fieldStyles.lightStyles,
  headingStyles.lightStyles,
  inputStyles.lightStyles,
  radioGroupStyles.lightStyles,
  selectStyles.lightStyles,
  stackStyles.lightStyles,
  textStyles.lightStyles,
  textareaStyles.lightStyles
] as const;
