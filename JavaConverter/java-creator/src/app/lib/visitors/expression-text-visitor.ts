import {
  ASTBinary,
  ASTConst,
  ASTEnumValue,
  ASTInstanceReference,
  ASTRobotAtPos,
  ASTUnary,
} from '../ast/ast-expr';
import { VisitorReturnType, accept } from '../ast/ast-visitor';

import { DefaultVisitorImpl } from '../ast/ast-visitors';

export class ExpressionTextVisitor extends DefaultVisitorImpl {
  protected expressionText: string[] = [];

  public getExtpressionText(): string {
    return this.expressionText.join(' ');
  }

  public override visitInstanceExpression(
    expr: ASTInstanceReference,
  ): void | VisitorReturnType {
    this.expressionText.push(expr.instanceId);
  }

  public override visitEnumExpression(expr: ASTEnumValue): void | VisitorReturnType {
    this.expressionText.push(expr.value);
  }

  public override visitConstExpression(expr: ASTConst): void | VisitorReturnType {
    this.expressionText.push(expr.value);
  }

  public override visitRobotAtPositionExpression(
    expr: ASTRobotAtPos,
  ): void | VisitorReturnType {
    const robotPos = expr.value?.instanceId;
    this.expressionText.push(robotPos ?? '<unknown position>');
  }

  public override visitUnaryExpression(expr: ASTUnary): void | VisitorReturnType {
    this.expressionText.push(expr.operator);
    this.expressionText.push('(');
    accept(expr.operand, this);
    this.expressionText.push(')');
    return VisitorReturnType.SKIP_CHILDREN;
  }

  public override visitBinaryExpression(expr: ASTBinary): void | VisitorReturnType {
    this.expressionText.push('(');
    accept(expr.left, this);
    this.expressionText.push(expr.operator);
    accept(expr.right, this);
    this.expressionText.push(')');
    return VisitorReturnType.SKIP_CHILDREN;
  }
}
