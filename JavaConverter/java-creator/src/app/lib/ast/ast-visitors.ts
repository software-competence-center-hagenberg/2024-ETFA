import {
  ASTBinary,
  ASTConst,
  ASTEnumValue,
  ASTExpression,
  ASTInstanceReference,
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
  ASTStatement,
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
import { Visitor, VisitorReturnType } from './ast-visitor';

import { ASTNode } from './ast-base';

export class DefaultVisitorImpl implements Visitor {
  public visitRoot(root: Sequence): void | VisitorReturnType {
    return this.visitNode(root);
  }

  public endRoot(root: Sequence): void {
    this.endNode(root);
  }

  public visitAssignmentStatement(
    stmt: ASTVariableStatement,
  ): void | VisitorReturnType {
    return this.visitNode(stmt);
  }

  public endAssignmentStatement(stmt: ASTVariableStatement): void {
    this.endNode(stmt);
  }

  public visitNode(_: ASTNode): void | VisitorReturnType {
    // nothing to do
  }

  public endNode(_: ASTNode): void {
    // nothing to do
  }

  public visitFunctionDefinition(
    opDef: FunctionDefinition,
  ): void | VisitorReturnType {
    return this.visitNode(opDef);
  }

  public endFunctionDefinition(opDef: FunctionDefinition): void {
    this.endNode(opDef);
  }

  public visitInstanceDefinition(
    instanceDef: InstanceDefinition,
  ): VisitorReturnType | void {
    return this.visitNode(instanceDef);
  }

  public endInstanceDefinition(instanceDef: InstanceDefinition): void {
    this.endNode(instanceDef);
  }

  public visitStatement(stmt: ASTStatement): void | VisitorReturnType {
    return this.visitNode(stmt);
  }

  public endStatement(stmt: ASTStatement): void {
    this.endNode(stmt);
  }

  public visitExpression(expr: ASTExpression): void | VisitorReturnType {
    return this.visitNode(expr);
  }

  public endExpression(expr: ASTExpression): void {
    this.endNode(expr);
  }

  public visitNoopStatement(stmt: ASTNoopStatement): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endNoopStatement(stmt: ASTNoopStatement): void {
    this.endStatement(stmt);
  }

  public visitCallStatement(stmt: ASTCallStatement): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endCallStatement(stmt: ASTCallStatement): void {
    return this.endStatement(stmt);
  }

  public visitArgument(arg: ASTCallArgument): void | VisitorReturnType {
    return this.visitNode(arg);
  }

  public endArgument(arg: ASTCallArgument): void {
    this.endNode(arg);
  }

  public visitWaitStatement(stmt: ASTWaitStatement): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endWaitStatement(stmt: ASTWaitStatement): void {
    this.endNode(stmt);
  }

  public visitConditionStatement(
    stmt: ASTConditionStatement,
  ): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public visitConditional(
    conditional: ASTConditional,
  ): void | VisitorReturnType {
    return this.visitNode(conditional);
  }

  public visitOtherwise(stmt: ASTConditionStatement): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endConditionStatement(stmt: ASTConditionStatement): void {
    this.endNode(stmt);
  }

  public visitSwitchStatement(
    stmt: ASTSwitchStatement,
  ): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public visitSwitchCase(
    c: ASTSwitchCase | ASTSwitchDefault,
  ): void | VisitorReturnType {
    return this.visitNode(c);
  }

  public visitLoopStatement(stmt: ASTLoopStatement): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endLoopStatement(stmt: ASTLoopStatement): void {
    this.endStatement(stmt);
  }

  public visitSectionStatement(
    stmt: ASTSectionStatement,
  ): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endSectionStatement(stmt: ASTSectionStatement): void {
    this.endStatement(stmt);
  }

  public visitSectionEndStatement(
    stmt: ASTSectionEndStatement,
  ): void | VisitorReturnType {
    return this.visitSectionEndStatement(stmt);
  }

  public endSectionEndStatement(stmt: ASTSectionEndStatement): void {
    return this.endSectionEndStatement(stmt);
  }

  public visitParallelStatement(
    stmt: ASTParallelStatement,
  ): void | VisitorReturnType {
    return this.visitStatement(stmt);
  }

  public endParallelStatement(stmt: ASTParallelStatement): void {
    this.endStatement(stmt);
  }

  public visitBranch(branch: ASTBranch): void | VisitorReturnType {
    return this.visitNode(branch);
  }

  public endBranch(branch: ASTBranch): void {
    this.endNode(branch);
  }

  public visitMeanWhileStatement(
    stmt: ASTMeanWhileStatement,
  ): void | VisitorReturnType {
    return this.visitMeanWhileStatement(stmt);
  }

  public endMeanWhileStatement(stmt: ASTMeanWhileStatement): void {
    this.endMeanWhileStatement(stmt);
  }

  public visitUnknownNode(node: ASTNode): void {
    return this.endNode(node);
  }

  public visitChangeStatement(
    stmt: ASTVariableStatement,
  ): void | VisitorReturnType {
    return this.endNode(stmt);
  }

  public endChangeStatement(stmt: ASTVariableStatement): void {
    this.endNode(stmt);
  }

  public visitInstanceExpression(
    expr: ASTInstanceReference,
  ): void | VisitorReturnType {
    return this.visitExpression(expr);
  }

  public endInstanceExpression(expr: ASTInstanceReference): void {
    this.endExpression(expr);
  }

  public visitEnumExpression(expr: ASTEnumValue): void | VisitorReturnType {
    return this.visitExpression(expr);
  }

  public endEnumExpression(expr: ASTEnumValue): void {
    this.endExpression(expr);
  }

  public visitConstExpression(expr: ASTConst): void | VisitorReturnType {
    return this.visitExpression(expr);
  }

  public endConstExpression(expr: ASTConst): void {
    this.endExpression(expr);
  }
  public visitUnaryExpression(expr: ASTUnary): void | VisitorReturnType {
    return this.visitExpression(expr);
  }

  public endUnaryExpression(expr: ASTUnary): void {
    this.endExpression(expr);
  }

  public visitBinaryExpression(expr: ASTBinary): void | VisitorReturnType {
    return this.visitExpression(expr);
  }

  public endBinaryExpression(expr: ASTBinary): void {
    this.endExpression(expr);
  }

  public visitRobotAtPositionExpression(
    expr: ASTRobotAtPos,
  ): void | VisitorReturnType {
    return this.visitRobotAtPositionExpression(expr);
  }

  public endRobotAtPositionExpression(expr: ASTRobotAtPos): void {
    this.endRobotAtPositionExpression(expr);
  }
}
