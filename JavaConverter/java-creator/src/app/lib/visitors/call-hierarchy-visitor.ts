import {
  Definition,
  FunctionDefinition,
  Sequence,
} from '../helper/program';
import { VisitorReturnType, accept } from '../ast/ast-visitor';

import { ASTCallStatement } from '../ast/ast-stmt';
import { DefaultVisitorImpl } from '../ast/ast-visitors';

/**
 *
 * Visits the function calls hierarchically
 */
export class CallHierarchyVisitor extends DefaultVisitorImpl {
  private definitions: Definition[] = [];
  private readonly functionStack: FunctionDefinition[] = [];
  public readonly hierarchy = new Map<
    FunctionDefinition,
    Set<FunctionDefinition>
  >();

  private get currentFunction(): FunctionDefinition | undefined {
    return this.functionStack[this.functionStack.length - 1];
  }

  public override visitRoot(root: Sequence): void | VisitorReturnType {
    this.definitions = root.definitions;
    const main = root.definitions.find((x) => x.id === root.entryPoint);
    accept(main, this);
    return VisitorReturnType.SKIP_CHILDREN;
  }

  public override visitFunctionDefinition(
    def: FunctionDefinition,
  ): VisitorReturnType | void {
    this.functionStack.push(def);
    const calls = this.hierarchy.get(def);
    if (calls === undefined) {
      this.hierarchy.set(def, new Set<FunctionDefinition>());
    } else {
      return VisitorReturnType.SKIP_CHILDREN;
    }
  }

  public override endFunctionDefinition() {
    this.functionStack.pop();
  }

  public override visitCallStatement(stmt: ASTCallStatement): VisitorReturnType | void {
    if (this.currentFunction === undefined) {
      console.warn('Function call outside a calling function');
      return VisitorReturnType.SKIP_CHILDREN;
    }

    if (stmt.kind === 'functionCall') {
      const functionDef = this.definitions.find(
        (def) => def.id === stmt.calleeId,
      );
      if (functionDef && functionDef.kind === 'function') {
        this.hierarchy.get(this.currentFunction)?.add(functionDef);
        accept(functionDef, this);
      }
    }
    return VisitorReturnType.SKIP_CHILDREN;
  }
}
