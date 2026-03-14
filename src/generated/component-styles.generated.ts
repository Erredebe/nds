import * as alertStyles from './components/alert/styles.generated.js';
import * as boxStyles from './components/box/styles.generated.js';
import * as buttonStyles from './components/button/styles.generated.js';
import * as cardStyles from './components/card/styles.generated.js';
import * as headingStyles from './components/heading/styles.generated.js';
import * as inputStyles from './components/input/styles.generated.js';
import * as stackStyles from './components/stack/styles.generated.js';
import * as textStyles from './components/text/styles.generated.js';

export interface GeneratedComponentStyleEntry {
  tagName: string;
  stylePath: string;
  shadowStyles: string;
  lightStyles: string;
}

export const generatedComponentStyles: Record<string, GeneratedComponentStyleEntry> = {
  'nds-alert': { lightStyles: alertStyles.lightStyles, shadowStyles: alertStyles.shadowStyles, stylePath: 'src/components/alert/styles.css', tagName: 'nds-alert' },
  'nds-box': { lightStyles: boxStyles.lightStyles, shadowStyles: boxStyles.shadowStyles, stylePath: 'src/components/box/styles.css', tagName: 'nds-box' },
  'nds-button': { lightStyles: buttonStyles.lightStyles, shadowStyles: buttonStyles.shadowStyles, stylePath: 'src/components/button/styles.css', tagName: 'nds-button' },
  'nds-card': { lightStyles: cardStyles.lightStyles, shadowStyles: cardStyles.shadowStyles, stylePath: 'src/components/card/styles.css', tagName: 'nds-card' },
  'nds-heading': { lightStyles: headingStyles.lightStyles, shadowStyles: headingStyles.shadowStyles, stylePath: 'src/components/heading/styles.css', tagName: 'nds-heading' },
  'nds-input': { lightStyles: inputStyles.lightStyles, shadowStyles: inputStyles.shadowStyles, stylePath: 'src/components/input/styles.css', tagName: 'nds-input' },
  'nds-stack': { lightStyles: stackStyles.lightStyles, shadowStyles: stackStyles.shadowStyles, stylePath: 'src/components/stack/styles.css', tagName: 'nds-stack' },
  'nds-text': { lightStyles: textStyles.lightStyles, shadowStyles: textStyles.shadowStyles, stylePath: 'src/components/text/styles.css', tagName: 'nds-text' }
};

export const generatedLightStyles = [
  alertStyles.lightStyles,
  boxStyles.lightStyles,
  buttonStyles.lightStyles,
  cardStyles.lightStyles,
  headingStyles.lightStyles,
  inputStyles.lightStyles,
  stackStyles.lightStyles,
  textStyles.lightStyles
] as const;
