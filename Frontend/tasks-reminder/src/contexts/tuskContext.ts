import React, { createContext} from 'react';
import type {TaskState, TaskAction} from '../types';

export interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  refreshTasks: () => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);
