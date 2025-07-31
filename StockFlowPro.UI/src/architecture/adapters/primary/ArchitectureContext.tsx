// Architecture Context
// React context for dependency injection

import { createContext } from 'react';
import { Dependencies } from '../../shared/DependencyContainer';

export const ArchitectureContext = createContext<Dependencies | null>(null);
export type { Dependencies };