import { ASTNode } from '../ast/ast-base';
import { ASTSequence } from '../ast/ast-stmt';
import { Argument } from './types';

export interface Sequence extends ASTNode {
  entryPoint: string;
  definitions: Definition[]
 // add further properties as needed
}

export type Definition = FunctionDefinition | InstanceDefinition;


export interface FunctionDefinition extends ASTNode {
  statements: ASTSequence,
  input?: (Argument & ASTNode)[];
  kind: 'function';
}

export interface InstanceDefinition extends ASTNode {
  kind: 'instance_def';
  // add further properties as needed
}
