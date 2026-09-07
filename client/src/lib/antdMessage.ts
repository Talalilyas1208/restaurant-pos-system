'use client';

import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { message as staticMessage } from 'antd';

let activeMessage: MessageInstance = staticMessage;

export function AntdAppBridge() {
  const { message } = App.useApp();
  activeMessage = message;
  return null;
}

export const message: MessageInstance = new Proxy({} as MessageInstance, {
  get(_target, prop: keyof MessageInstance) {
    if (activeMessage && typeof activeMessage[prop] === 'function') {
      return (activeMessage[prop] as (...args: unknown[]) => unknown).bind(activeMessage);
    }
    return activeMessage?.[prop];
  },
});
