import { ASTExpression } from './ast-expr';
import { ASTNode } from './ast-base';

export type LoopType = 'while' | 'until';

/**
 * @title No-op statement
 * @description A statement that does nothing. Usually only required for testing.
 */
export interface ASTNoopStatement extends ASTNode {
  kind: 'noop';
}

export type ASTCallStatement =
  | ASTFunctionCallStatement
  | ASTOperationCallStatement;

/**
 * @title Call statement
 * @description A function call with (optional) call arguments
 */
export interface ASTFunctionCallStatement extends ASTNode {
  kind: 'functionCall' | 'call';
  calleeId: string;
  inputArguments?: ASTExpression[];
}

/**
 * @title Call statement
 * @description An operation call with (optional) call arguments
 */
export interface ASTOperationCallStatement extends ASTNode {
  kind: 'operationCall' | 'call';
  calleeId: string;
  inputArguments?: ASTExpression[];
}

/**
 * @title Argument of a call statement
 * @description Only used inside the arguments-array of a call statement.
 * @deprecated Do not use value in ASTOperationCallStatement and ASTFunctionCallStatement anymore.
 */
export interface ASTCallArgument extends ASTNode {
  value: ASTExpression;
}

export interface ASTWaitStatement extends ASTNode {
  kind: 'wait';
  condition: ASTExpression;
}

/**
 * @title Conditional branch of a multi-condition statement
 * @description If the condition of a conditional is satisfied, the then sequence will be executed.
 */
export interface ASTConditional extends ASTNode {
  /**
   * @title Condition
   * @description If the condition is satisfied, the then sequence will be executed
   */
  condition: ASTExpression;

  /**
   * @title Conditional sequence
   * @description Will be executed, if the condition is satisifed
   */
  then: ASTSequence;
}

/**
 * @title Condition statement
 * @description Support multiple conditions similar to a cascading 'if-else-if', e.g.
 * if (a) doA()
 * else if (b) doB()
 * else if (c) doC()
 * else doOtherwise().
 */
export interface ASTConditionStatement extends ASTNode {
  kind: 'if';

  /**
   * @title List of conditional branches
   * @description Every item represents a conditional branch that will be executed, if the condition is satisifed.
   * In this case, all following conditionals and the else branch are ignored.
   */
  conditionals: ASTConditional[];

  /**
   * @title Else branch of the multi-condition statement
   * @description This sequence is executed, if none of the conditions is satisified.
   */
  else?: ASTSequence;
}

/**
 * @title Switch case
 */
export interface ASTSwitchCase extends ASTNode {
  case: any;
  then: ASTSequence;
}

/**
 * @title Switch default case
 */
export interface ASTSwitchDefault extends ASTNode {
  default: true;
  then: ASTSequence;
}

/**
 * @title Switch statement
 * @description E.g.
 * switch(expression) {
 * case a: doA()
 * case b: doB()
 * case c: doC()
 * default: doDefault()
 * }
 */
export interface ASTSwitchStatement extends ASTNode {
  kind: 'switch';
  expression: ASTExpression;
  cases: (ASTSwitchCase | ASTSwitchDefault)[];
}

/**
 * @title Section of statements
 * @description Named sections should be used to organize the program for improved readability and understandability.
 */
export interface ASTSectionStatement extends ASTNode {
  kind: 'section';

  /**
   * @title Displayable name
   */
  name: string;
  statements: ASTSequence;
}

export interface ASTVariableStatement extends ASTNode {
  kind: 'assignment' | 'change';
  instanceId: string;
  value: ASTExpression;
}

export interface ASTSectionEndStatement extends ASTNode {
  kind: 'sectionEnd';
}

export interface ASTPlaceholderStatement extends ASTNode {
  kind: 'statement_placeholder';
  severity: 'error' | 'warning' | 'info';
  data: unknown;
}

/**
 * @title Loop statement
 * @description The 'while' loop repeats while the condition is satisifed,
 * whereas the 'until' loop stops repeating, when the condition is satisified.
 * Both check the condition before the loop body is executed.
 */
export interface ASTLoopStatement extends ASTNode {
  kind: LoopType;
  condition: ASTExpression;
  statements: ASTSequence;
}

/**
 * @title Branch of execution
 */
export interface ASTBranch extends ASTNode {
  open?: boolean;
  statements: ASTSequence;
}

/**
 * @title Parallel branches statement
 * @description Supports an arbitrary number of branches to be executed in parallel.
 * Every branch can either be open or non-open. The parallel branches statement blocks until all non-open branches have been executed.
 * If there are just open branches, the parallel branches statement does not block at all, i.e. flow of execution continues immediately.
 * By default, a branch is non-open.
 */
export interface ASTParallelStatement extends ASTNode {
  kind: 'parallel';
  branches: ASTBranch[];
}

export interface ASTMeanWhileStatement extends ASTNode {
  kind: 'meanWhile';
  statements?: ASTSequence;
}

/**
 * @title A statement
 */
export type ASTStatement =
  | ASTCallStatement
  | ASTWaitStatement
  | ASTConditionStatement
  | ASTLoopStatement
  | ASTNoopStatement
  | ASTParallelStatement
  | ASTMeanWhileStatement
  | ASTSectionStatement
  | ASTSectionEndStatement
  | ASTSwitchStatement
  | ASTPlaceholderStatement;

export type ASTSequence = ASTStatement[];
