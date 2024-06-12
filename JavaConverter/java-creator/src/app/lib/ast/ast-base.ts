export interface ASTNode {
  /* title of the sequence */
  id: string;

  /**
   * the revision counter is incremented when the node gets modified.
   * this mechansim can be used for change detection.
   * It is particularly useful when used with derived (view)-models:
   * Because in this case checking for reference equality would involve somehow caching the unchanged parts of the derived model
   * So for now it is easier to check the revision
   */
  revision?: number;

  /**
   * Comments are used for documentation and have no influence on the execution flow.
   */
  comment?: string | string[];
}
