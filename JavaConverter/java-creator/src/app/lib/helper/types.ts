import { ASTNode } from '../ast/ast-base';

interface Element extends ASTNode {
  // Add further properties as needed
}

export interface InstanceType extends Element {
  // Add further properties as needed
}

export interface EnumType extends Element {
  // add further properties as needed
}

export type Type = InstanceType | EnumType;

export interface EnumValue extends Element {
  // add further properties as needed
}

export interface Instance extends Element {
  // add further properties as needed
}

export interface Operation extends Element {
 // add further properties as needed
}

export interface Argument extends Element {
  typeId: string
  // add further properties as needed
}
