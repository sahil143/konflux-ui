import * as React from 'react';
import { AnalyticsButtonProperties } from '../../../utils/analytics';

export type Action = {
  id: string;
  label: React.ReactNode;
  description?: string;
  cta: (() => void) | { href: string; external?: boolean };
  disabled?: boolean;
  disabledTooltip?: string;
  tooltip?: string;
  icon?: string | React.ReactNode;
  path?: string;
  analytics?: AnalyticsButtonProperties;
};

/** ActionGroup contributes an action group that can also be a submenu */
export type ActionGroup = {
  id: string;
  label?: string;
  submenu?: boolean;
};

export type MenuOption = Action | GroupedMenuOption;

export type GroupedMenuOption = ActionGroup & {
  children?: MenuOption[];
};

export enum MenuOptionType {
  GROUP_MENU,
  SUB_MENU,
  ATOMIC_MENU,
}

export enum ActionMenuVariant {
  KEBAB = 'plain',
  DROPDOWN = 'default',
  PRIMARY = 'primary',
}
