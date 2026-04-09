export interface Message {
  severity: 'info' | 'warn' | 'error' | 'success';
  title: string;
  message: string;
  icon?: string;
}