import { ASTNode } from './ast-base';

export type ASTReference = ASTInstanceReference | ASTVariableReference;

/**
 * @title Instance reference
 * @description A reference to an instance, i.e. a variable or object
 */
export interface ASTInstanceReference extends ASTNode {
  kind: 'instance';
  instanceId: string;
  typeId?: string;
}

/**
 * @title Variable reference
 * @description A reference to a variable
 */
export interface ASTVariableReference extends ASTNode {
  kind: 'variable';
  variableId: string;
}

/**
 * @title Enumeration value
 * @description The value of an enumeration.
 */
export interface ASTEnumValue extends ASTNode {
  kind: 'enum';
  value: string;
  typeId: string;
}

/**
 * @title Constant expression
 * @description A constant value, e.g. '5' or the string 'hello'
 */
export interface ASTConst extends ASTNode {
  kind: 'const';
  value: any;
  typeId?: string;
}

export type UnaryOperator = 'not' | '!' | '-';

/**
 * @title Unary expression
 * @description Expression with just one single operand, e.g. 'not' or '-' (negate)
 */
export interface ASTUnary extends ASTNode {
  kind: 'unary';
  operator: UnaryOperator;
  operand: ASTExpression;
}

export type BinaryOperator =
  | 'and'
  | '&'
  | 'or'
  | '|'
  | 'eq'
  | '=='
  | 'neq'
  | '!='
  | 'gt'
  | '>'
  | 'gte'
  | '>='
  | 'lt'
  | '<'
  | 'lte'
  | '<=';

/**
 * @title Binary expression
 * @description Expression with two operands, e.g. 'and', 'or' or '+' (add)
 */
export interface ASTBinary extends ASTNode {
  kind: 'binary';
  operator: BinaryOperator;
  left: ASTExpression;
  right: ASTExpression;
}

export interface ASTRobotAtPos extends ASTNode {
  kind: 'robotAtPos';
  value?: ASTInstanceReference;
}

export interface ASTPlaceholderExpression extends ASTNode {
  kind: 'expression_placeholder';
  severity: 'error' | 'warning' | 'info';
  data: any;
}

/**
 * @title An expression
 */
export type ASTExpression =
  | ASTUnary
  | ASTBinary
  | ASTConst
  | ASTEnumValue
  | ASTReference
  | ASTRobotAtPos
  | ASTPlaceholderExpression;
