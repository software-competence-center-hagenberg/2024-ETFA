import {
  ASTBinary,
  ASTConst,
  ASTEnumValue,
  ASTReference,
  ASTRobotAtPos,
  ASTUnary,
} from './ast-expr';
import {
  ASTBranch,
  ASTCallArgument,
  ASTCallStatement,
  ASTConditionStatement,
  ASTConditional,
  ASTLoopStatement,
  ASTMeanWhileStatement,
  ASTNoopStatement,
  ASTParallelStatement,
  ASTSectionEndStatement,
  ASTSectionStatement,
  ASTSequence,
  ASTSwitchCase,
  ASTSwitchDefault,
  ASTSwitchStatement,
  ASTVariableStatement,
  ASTWaitStatement,
} from './ast-stmt';
import {
  FunctionDefinition,
  InstanceDefinition,
  Sequence,
} from '../helper/program';

import { ASTNode } from './ast-base';

export enum VisitorReturnType {
  SKIP_CHILDREN,
}

export interface Visitor {
  visitUnknownNode(node: ASTNode): void;

  visitRoot(pgm: Sequence): VisitorReturnType | void;
  endRoot(pgm: Sequence): void;

  visitConditionStatement(
    stmt: ASTConditionStatement,
  ): VisitorReturnType | void;
  visitConditional(conditional: ASTConditional): VisitorReturnType | void;
  visitOtherwise(stmt: ASTConditionStatement): VisitorReturnType | void;
  endConditionStatement(stmt: ASTConditionStatement): void;

  visitWaitStatement(stmt: ASTWaitStatement): VisitorReturnType | void;
  endWaitStatement(stmt: ASTWaitStatement): void;

  visitCallStatement(stmt: ASTCallStatement): VisitorReturnType | void;
  endCallStatement(stmt: ASTCallStatement): void;

  visitLoopStatement(stmt: ASTLoopStatement): VisitorReturnType | void;
  endLoopStatement(stmt: ASTLoopStatement): void;

  visitSwitchStatement(stmt: ASTSwitchStatement): VisitorReturnType | void;
  visitSwitchCase(
    c: ASTSwitchCase | ASTSwitchDefault,
  ): VisitorReturnType | void;

  visitSectionStatement(stmt: ASTSectionStatement): VisitorReturnType | void;
  endSectionStatement(stmt: ASTSectionStatement): void;

  visitSectionEndStatement(
    stmt: ASTSectionEndStatement,
  ): VisitorReturnType | void;
  endSectionEndStatement(stmt: ASTSectionEndStatement): void;

  visitParallelStatement(stmt: ASTParallelStatement): VisitorReturnType | void;
  endParallelStatement(stmt: ASTParallelStatement): void;

  visitMeanWhileStatement(
    stmt: ASTMeanWhileStatement,
  ): VisitorReturnType | void;
  endMeanWhileStatement(stmt: ASTMeanWhileStatement): void;

  visitBranch(branch: ASTBranch): VisitorReturnType | void;
  endBranch(branch: ASTBranch): void;

  visitInstanceExpression(expr: ASTReference): VisitorReturnType | void;
  endInstanceExpression(expr: ASTReference): void;

  visitRobotAtPositionExpression(expr: ASTRobotAtPos): VisitorReturnType | void;
  endRobotAtPositionExpression(expr: ASTRobotAtPos): void;

  visitEnumExpression(expr: ASTEnumValue): VisitorReturnType | void;
  endEnumExpression(expr: ASTEnumValue): void;

  visitConstExpression(expr: ASTConst): VisitorReturnType | void;
  endConstExpression(expr: ASTConst): void;

  visitArgument(arg: ASTCallArgument): VisitorReturnType | void;
  endArgument(arg: ASTCallArgument): void;

  visitUnaryExpression(expr: ASTUnary): VisitorReturnType | void;
  endUnaryExpression(expr: ASTUnary): void;

  visitBinaryExpression(expr: ASTBinary): VisitorReturnType | void;
  endBinaryExpression(expr: ASTBinary): void;

  visitNoopStatement(stmt: ASTNoopStatement): void;
  endNoopStatement(stmt: ASTNoopStatement): void;

  visitFunctionDefinition(
    opDef: FunctionDefinition,
  ): VisitorReturnType | void;
  endFunctionDefinition(opDef: FunctionDefinition): void;

  visitInstanceDefinition(
    instanceDef: InstanceDefinition,
  ): VisitorReturnType | void;
  endInstanceDefinition(instanceDef: InstanceDefinition): void;

  visitAssignmentStatement(
    stmt: ASTVariableStatement,
  ): VisitorReturnType | void;
  endAssignmentStatement(stmt: ASTVariableStatement): void;

  visitChangeStatement(stmt: ASTVariableStatement): VisitorReturnType | void;
  endChangeStatement(stmt: ASTVariableStatement): void;
}

export function visitChildren(v?: VisitorReturnType | void): boolean {
  return v !== VisitorReturnType.SKIP_CHILDREN;
}

type Guide = (node: any, visitor: Partial<Visitor>) => void;
type GuideRegistry<T extends keyof any> = Record<T, Guide>;

const Guides: GuideRegistry<string> = {
  if: acceptConditionStatement,
  call: acceptCallStatement,
  operationCall: acceptCallStatement,
  functionCall: acceptCallStatement,
  while: acceptLoopStatement,
  until: acceptLoopStatement,
  switch: acceptSwitch,
  section: acceptSectionStatement,
  sectionEnd: acceptSectionEndStatement,
  instance: acceptInstanceReferenceExpression,
  variable: acceptInstanceReferenceExpression,
  enum: acceptEnumValueExpression,
  const: acceptConst,
  argument: acceptArgument,
  unary: acceptUnary,
  binary: acceptBinary,
  parallel: acceptParallelStatement,
  noop: acceptNoop,
  sequence: acceptRoot,
  subsequence: acceptSequence,
  function: acceptFunctionDefinition,
  instance_def: acceptInstanceDefinition,
  robotAtPos: acceptRobotAtPositionExpression,
  meanWhile: acceeptMeanWhileStatement,
  assignment: acceptAssignmentStatement,
  change: acceptChangeStatement,
  conditional: acceptConditional,
  wait: acceptWaitStatement,
};

export function accept(
  node: any,
  visitor: Partial<Visitor>,
  kind?: string,
): void {
  if (kind === undefined) {
    if ('kind' in node && typeof node.kind === 'string') {
      kind = node.kind as string;
    } else {
      console.warn('Cannot accept node without kind:', node);
      return;
    }
  }

  const guide = Guides[kind];

  if (guide === undefined) {
    acceptUnsupportedNode(node, visitor);
    return;
  }
  guide(node, visitor);
}

function acceptUnsupportedNode(node: ASTNode, visitor: Partial<Visitor>): void {
  console.warn('node not supported yet:', node);
  visitor.visitUnknownNode?.(node);
}

export function acceptSequence(
  sequence: ASTSequence | undefined,
  visitor: Partial<Visitor>,
): void {
  if (sequence === undefined) {
    return;
  }

  if (Array.isArray(sequence)) {
    for (const stmt of sequence) {
      accept(stmt, visitor);
    }
  } else {
    accept(sequence, visitor);
  }
}

function acceptRoot(pgm: Sequence, visitor: Partial<Visitor>): void {
  if (visitChildren(visitor.visitRoot?.(pgm))) {
    pgm.definitions.forEach((def) => accept(def, visitor));
  }
  visitor.endRoot?.(pgm);
}

function acceptFunctionDefinition(
  opDef: FunctionDefinition,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitFunctionDefinition?.(opDef))) {
    acceptSequence(opDef.statements, visitor);
  }
  visitor.endFunctionDefinition?.(opDef);
}

function acceptInstanceDefinition(
  instanceDef: InstanceDefinition,
  visitor: Partial<Visitor>,
): void {
  visitor.visitInstanceDefinition?.(instanceDef);
  visitor.endInstanceDefinition?.(instanceDef);
}

function acceptNoop(stmt: ASTNoopStatement, visitor: Partial<Visitor>): void {
  visitor.visitNoopStatement?.(stmt);
  visitor.endNoopStatement?.(stmt);
}

function acceptAssignmentStatement(
  stmt: ASTVariableStatement,
  visitor: Partial<Visitor>,
): void {
  visitor.visitAssignmentStatement?.(stmt);
  visitor.endAssignmentStatement?.(stmt);
}

function acceptChangeStatement(
  stmt: ASTVariableStatement,
  visitor: Partial<Visitor>,
): void {
  visitor.visitChangeStatement?.(stmt);
  visitor.endChangeStatement?.(stmt);
}

function acceptArgument(arg: ASTCallArgument, visitor: Partial<Visitor>): void {
  if (visitChildren(visitor.visitArgument?.(arg))) {
    accept(arg.value, visitor);
  }
  visitor.endArgument?.(arg);
}

function acceptConst(expr: ASTConst, visitor: Partial<Visitor>): void {
  visitor.visitConstExpression?.(expr);
  visitor.endConstExpression?.(expr);
}

function acceptEnumValueExpression(
  expr: ASTEnumValue,
  visitor: Partial<Visitor>,
): void {
  visitor.visitEnumExpression?.(expr);
  visitor.endEnumExpression?.(expr);
}

function acceptInstanceReferenceExpression(
  ref: ASTReference,
  visitor: Partial<Visitor>,
): void {
  visitor.visitInstanceExpression?.(ref);
  visitor.endInstanceExpression?.(ref);
}

function acceptRobotAtPositionExpression(
  exp: ASTRobotAtPos,
  visitor: Partial<Visitor>,
): void {
  visitor.visitRobotAtPositionExpression?.(exp);
  visitor.endRobotAtPositionExpression?.(exp);
}

function acceptSectionStatement(
  stmt: ASTSectionStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitSectionStatement?.(stmt))) {
    acceptSequence(stmt.statements, visitor);
  }
  visitor.endSectionStatement?.(stmt);
}

function acceptSectionEndStatement(
  stmt: ASTSectionEndStatement,
  visitor: Partial<Visitor>,
): void {
  visitor.visitSectionEndStatement?.(stmt);
  visitor.endSectionEndStatement?.(stmt);
}

function acceptLoopStatement(
  stmt: ASTLoopStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitLoopStatement?.(stmt))) {
    accept(stmt.condition, visitor);
    acceptSequence(stmt.statements, visitor);
  }
  visitor.endLoopStatement?.(stmt);
}

/**
 * switch(x) {
 * case 'x': doA(); doB(); doC();
 * default: doE();
 * }
 */
function acceptSwitch(
  stmt: ASTSwitchStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitSwitchStatement?.(stmt))) {
    accept(stmt.expression, visitor);
    stmt.cases.forEach((c) => {
      acceptSwitchCase(c, visitor);
    });
  }
}

function acceptSwitchCase(
  c: ASTSwitchCase | ASTSwitchDefault,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitSwitchCase?.(c))) {
    acceptSequence(c.then, visitor);
  }
}

function acceptCallStatement(
  stmt: ASTCallStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitCallStatement?.(stmt))) {
    stmt.inputArguments?.forEach((arg) => accept(arg, visitor));
    // stmt.arguments?.forEach((arg) => accept(arg, visitor, 'argument'));
  }
  visitor.endCallStatement?.(stmt);
}

function acceptConditionStatement(
  stmt: ASTConditionStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitConditionStatement?.(stmt))) {
    stmt.conditionals.forEach((c) => {
      acceptConditional(c, visitor);
    });

    if (stmt.else && visitChildren(visitor.visitOtherwise?.(stmt))) {
      acceptSequence(stmt.else, visitor);
    }
  }
  visitor.endConditionStatement?.(stmt);
}

function acceptConditional(
  conditional: ASTConditional,
  visitor: Partial<Visitor>,
) {
  if (visitChildren(visitor.visitConditional?.(conditional))) {
    accept(conditional.condition, visitor);
    acceptSequence(conditional.then, visitor);
  }
}

function acceptWaitStatement(
  stmt: ASTWaitStatement,
  visitor: Partial<Visitor>,
) {
  if (visitChildren(visitor.visitWaitStatement?.(stmt))) {
    accept(stmt.condition, visitor);
  }
  visitor.endWaitStatement?.(stmt);
}

function acceptBranch(branch: ASTBranch, visitor: Partial<Visitor>): void {
  if (visitChildren(visitor.visitBranch?.(branch))) {
    acceptSequence(branch.statements, visitor);
  }
  visitor.endBranch?.(branch);
}

function acceptParallelStatement(
  stmt: ASTParallelStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitParallelStatement?.(stmt))) {
    stmt.branches.forEach((branch) => acceptBranch(branch, visitor));
  }
  visitor.endParallelStatement?.(stmt);
}

function acceeptMeanWhileStatement(
  stmt: ASTMeanWhileStatement,
  visitor: Partial<Visitor>,
): void {
  if (visitChildren(visitor.visitMeanWhileStatement?.(stmt))) {
    acceptSequence(stmt.statements, visitor);
  }
  visitor.endMeanWhileStatement?.(stmt);
}

/* ======== EXPRESSIONS ========= */
function acceptUnary(expr: ASTUnary, visitor: Partial<Visitor>): void {
  if (visitChildren(visitor.visitUnaryExpression?.(expr))) {
    accept(expr.operand, visitor);
  }
  visitor.endUnaryExpression?.(expr);
}

function acceptBinary(expr: ASTBinary, visitor: Partial<Visitor>): void {
  if (visitChildren(visitor.visitBinaryExpression?.(expr))) {
    accept(expr.left, visitor);
    accept(expr.right, visitor);
  }
  visitor.endBinaryExpression?.(expr);
}
