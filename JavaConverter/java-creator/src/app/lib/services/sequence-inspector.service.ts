import { FunctionDefinition, Sequence } from '../helper/program';

import { CallHierarchyVisitor } from '../visitors/call-hierarchy-visitor';
import { Injectable } from '@angular/core';
import { accept } from '../ast/ast-visitor';

@Injectable({
  providedIn: 'root',
})
export class SequenceInspectorService {
 
  /**
   *
   * @param program
   * @returns the called function calls hierarchically
   */
  public getCallHierarchy(
    program: Sequence,
  ): Map<FunctionDefinition, Set<FunctionDefinition>> {
    const visitor = new CallHierarchyVisitor();
    if ('kind' in program) {
      accept(program, visitor);
    }
    return visitor.hierarchy;
  }

}
