/**
 * Componentes compartilhados/reutilizáveis
 */

export { Sidebar } from './Sidebar';
export type { SidebarProps, SidebarWidth } from './Sidebar';

export { TableOfContents } from './TableOfContents';
export type { TableOfContentsProps, TOCSection } from './TableOfContents';

export { default as NotificationProvider } from './NotificationProvider';

export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { EditableText } from './EditableText';
export type { EditableTextProps } from './EditableText';

export { EditableNumber } from './EditableNumber';
export type { EditableNumberProps } from './EditableNumber';

export { EditableSelect } from './EditableSelect';
export type { EditableSelectProps, SelectOption } from './EditableSelect';

export { DiceRoller } from './DiceRoller';
export type { DiceRollerProps } from './DiceRoller';

export { DiceRollResult } from './DiceRollResult';
export type { DiceRollResultProps } from './DiceRollResult';

export { OnlineIndicator } from './OnlineIndicator';

export { InstallPrompt } from './InstallPrompt';

export { BackupReminder } from './BackupReminder';

export { DiceRollHistory } from './DiceRollHistory';
export type { DiceRollHistoryProps } from './DiceRollHistory';
