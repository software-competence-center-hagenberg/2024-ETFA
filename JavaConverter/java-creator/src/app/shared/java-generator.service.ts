import { Injectable } from '@angular/core';
import { SequenceInspectorService } from '../lib/services/sequence-inspector.service';
import { FunctionDefinition, Sequence } from '../lib/helper/program';
import { Argument } from '../lib/helper/types';
import { ASTNode } from '../lib/ast/ast-base';
import { ASTBranch, ASTCallStatement, ASTConditionStatement, ASTConditional, ASTLoopStatement, ASTParallelStatement, ASTSequence, ASTStatement, ASTSwitchCase, ASTSwitchDefault, ASTSwitchStatement, ASTWaitStatement } from '../lib/ast/ast-stmt';
import { ASTBinary, ASTEnumValue, ASTExpression, ASTInstanceReference, ASTReference, ASTRobotAtPos, ASTUnary } from '../lib/ast/ast-expr';
import { ExpressionTextVisitor } from '../lib/visitors/expression-text-visitor';
import { accept } from '../lib/ast/ast-visitor';


@Injectable({
  providedIn: 'root'
})
export class JavaGeneratorService {
	inspectorService: SequenceInspectorService = new SequenceInspectorService();
	private functionDefs: Map<string, string[]> = new Map();
	private isEntry: boolean = true;
	private identation: string = '\t';
	private members: Set<string> = new Set();

	generateJaveCodeOfSequence(sequence: Sequence) {
		this.members = new Set();
		const hierarchyCalls = this.inspectorService.getCallHierarchy(sequence);
		const classNameFq = this.getNameOfId(sequence.id);
		let methods: string[] = []

		let classDecl: string = `public class ${this.removePackage(classNameFq)} {\n`;
		this.isEntry = true;
		hierarchyCalls.forEach((_: Set<FunctionDefinition> , functionDef: FunctionDefinition) => {
			let method: string = ''
			const functionName = this.isEntry ? 'start' : this.getNameOfId(functionDef.id);	
			this.functionDefs.set(functionName, []);
			this.addInputs(functionDef);
			method += this.createFunctionDefinition(functionName, 1);
			method += this.createFunctionBody(functionDef, 2);
			methods.push(method);
			this.isEntry = false;
		})

		if(this.members.size > 0) classDecl += this.addMemberDefinition(1);
		classDecl += this.createCtor(this.removePackage(classNameFq));
		classDecl += methods.join('\n') + '}';
		console.log(classDecl);
	}


	private addMemberDefinition(identationLevel: number): string {
		let code: string = '';
		this.members.forEach(member => {
			const type = 'Object';
			code += `${this.identation.repeat(identationLevel)}private ${this.removePackage(type as string)} ${this.removePackage(member)};\n`
		})
		return code;
	}

	private createCtor(className: string): string {
		let ctor: string = `\n${this.identation}public ${className}(`;
		if(this.members) {
			ctor += this.createCtorFormalParameters(this.members) + ') {\n';
			ctor += this.createSetMembers(this.members);
			ctor += `${this.identation}}\n\n`;
		} else {
			ctor += ') {}\n\n'
		}
		
		return ctor;
	}

	private createCtorFormalParameters(members: Set<string>) {
		const formalParameters: string[] = [];
		members.forEach(member => formalParameters.push(`Object ${this.removePackage(member)}`));
		return formalParameters.join(', ');
	}

	private createSetMembers(members: Set<string>) {
		let setMembers: string = '';
		members.forEach(member => setMembers += `${this.identation.repeat(2)}this.${this.removePackage(member)} = ${this.removePackage(member)};\n`)
		return setMembers;
	}

	private createFunctionDefinition(functionName: string, identationLevel: number) {
		let def = this.identation.repeat(identationLevel);
		def += this.isEntry ? 'public void ' : 'private void ';

		return def + `${functionName.slice(functionName.lastIndexOf('.') + 1)} (${this.functionDefs.get(functionName)?.join(', ')})`
	}

	private createFunctionBody(functionDef: FunctionDefinition, identationLevel: number) {
		return ` {\n${this.createStatements(functionDef.statements, identationLevel)}${this.identation.repeat(identationLevel - 1)}}\n`;
	}

	private createStatements(statements: ASTSequence, identationLevel: number): string {
		let code: string[] = [];
		statements.forEach((statement: ASTStatement) => code.push(this.createStatement(statement, identationLevel)))
		return code.join('\n');
	}

	private createStatement(statement: ASTStatement, identationLevel: number): string {
		let statementCode: string = '';
		switch(statement.kind) {
			case 'functionCall': statementCode = this.createCallStatement(statement as ASTCallStatement); break;
			case 'call': statementCode =this.createCallStatement(statement as ASTCallStatement); break;
			case 'operationCall': statementCode = this.createCallStatement(statement as ASTCallStatement); break; // return?
			case 'wait': statementCode = this.createWaitStatement(statement as ASTWaitStatement); break;
			case 'if': statementCode = this.createIfStatement(statement as ASTConditionStatement, identationLevel); break;
			case 'while': statementCode = this.createLoopStatement(statement as ASTLoopStatement, identationLevel); break;
			case 'until': statementCode = this.createLoopStatement(statement as ASTLoopStatement, identationLevel); break;
			case 'noop': break;
			case 'parallel': statementCode = this.createParallelStatement(statement as ASTParallelStatement, identationLevel); break;
			case 'meanWhile': break; // Not relevant
			case 'section': break; // Not relevant for java code
			case 'sectionEnd': break; // Not relevant for java code
			case 'switch': statementCode = this.createSwitchStatement(statement as ASTSwitchStatement, identationLevel); break;
			case 'statement_placeholder': break; // Not relevant for java code
			default: throw new Error('undefined statement kind');
		}

		return this.identation.repeat(identationLevel) + statementCode;

	}

	private createCallStatement(statement: ASTCallStatement) {
		const functionName = this.getNameOfId(statement.calleeId);
		let refName = this.findMember(functionName);
		let staticRef: string | undefined = '';
		if(refName) {
			this.members.add(refName);
		} 
		return `${refName ? this.removePackage(functionName) : staticRef ? this.removePackage(staticRef) : functionName.slice(functionName.lastIndexOf('.') + 1)}(${this.createCallParameters(statement)});\n`;
	}

	private findMember(calleeId: string): string | undefined {
		let refName = '';
		while(calleeId.indexOf('.') !== -1) {
			let extensionRef = calleeId.slice(0, calleeId.indexOf('.'))
			refName += refName === '' ? extensionRef : '.' + extensionRef;
			calleeId = calleeId.replace(extensionRef + '.' ,'');
			
			return refName;
			
		}
		// no member => own function called
		return undefined
	}

	private createCallParameters(statement: ASTCallStatement) {
		let inputs: string[] = [];
		statement.inputArguments?.forEach((expression: ASTExpression) => {
			if(expression.kind === 'enum') {
				inputs.push(`${this.removePackage(this.getNameOfId(expression.typeId))}.${expression.value}`)
			} else {
				inputs.push(this.getExpressionText(expression));
			}
		})
		return inputs.join(', ');
	}

	private createWaitStatement(statement: ASTWaitStatement) {
		return `while (!${this.getExpressionText(statement.condition)}) {}\n`;
	}

	private createIfStatement(statement: ASTConditionStatement, identationLevel: number) {
		let code: string = '';
		statement.conditionals.forEach((condition: ASTConditional, index: number) => {
			code += this.createCondition(condition, index === 0, identationLevel);
		})

		if(statement.else) code += this.createElseBranch(statement.else, identationLevel);
		return code;
	}


	private createCondition(condition: ASTConditional, isFirst: boolean, identationLevel: number): string {
		let code: string = isFirst ? 'if' : `${this.identation.repeat(identationLevel)}else if`;
		code += ` (${condition.condition.kind !== 'instance' ? this.getExpressionText(condition.condition) : this.getNameOfId(this.getExpressionText(condition.condition))})`;
		code += ` {\n${this.createStatements(condition.then, identationLevel + 1)}${this.identation.repeat(identationLevel)}}\n`
		return code;
	}

	private createElseBranch(sequence: ASTSequence, identationLevel: number) {
		return `${this.identation.repeat(identationLevel)}else {\n${this.createStatements(sequence, identationLevel + 1)}${this.identation.repeat(identationLevel)}}\n`;
	}

	private createLoopStatement(statement: ASTLoopStatement, identationLevel: number) {
		let code: string = statement.kind;
		if(code === 'while') {
			code += ` (${this.getExpressionText(statement.condition)})`;
		} else {
			code += ` (!(${this.getExpressionText(statement.condition)}))`;
		}
		code += ` {\n${this.createStatements(statement.statements, identationLevel + 1)}\n${this.identation.repeat(identationLevel)}}\n`;
		return code;
	}

	private createParallelStatement(statement: ASTParallelStatement, identationLevel: number): string {
		let code: string = '';
		let nonOpen: string[] = [];
		
		statement.branches.forEach((branch: ASTBranch, index: number) => {
			code += this.createBranchStatement(branch, index, identationLevel);
			if(!branch.open) nonOpen.push(`t${index}`);
		})

		nonOpen.forEach(thread => { code += `${this.identation.repeat(identationLevel) + thread}.join();\n`})	

		return code;
	}

	private createBranchStatement(branch: ASTBranch, index: number, identationLevel: number) {
		return `${index !== 0 ? this.identation.repeat(identationLevel) : ''}Thread t${index} = new Thread (() -> {\n ${this.createStatements(branch.statements, identationLevel + 1)}\n${this.identation.repeat(identationLevel)}}).start();\n`
	}

	private createSwitchStatement(statement: ASTSwitchStatement, identationLevel: number) {
		let expression: string = statement.expression.kind === 'enum' ? this.getNameOfId((statement.expression as ASTEnumValue).typeId) : this.getExpressionText(statement.expression);

		return `${this.identation.repeat(identationLevel)}switch (${expression}) {\n${this.createCases(statement.cases, identationLevel + 1)}};`;
	}

	private createCases(cases: (ASTSwitchCase | ASTSwitchDefault)[], identationLevel: number): string {
		let code: string = '';
		let defaultCase: ASTSwitchDefault | undefined = undefined;

		cases.forEach((caseBranch) => {
			if('default' in caseBranch && !defaultCase) {
				defaultCase = caseBranch;
			} else {
				code += `${this.identation.repeat(identationLevel)}case ${(caseBranch as ASTSwitchCase).case}:\n${this.createStatements(caseBranch.then, identationLevel + 1)} break;\n`;
			}
		})

		if(defaultCase) {
			code += `${this.identation.repeat(identationLevel)}default: ${this.createStatements((defaultCase as ASTSwitchDefault).then, identationLevel + 1)} break;\n`;
		}

		return code;
	}

	private getExpressionText(expression: ASTExpression): string {
		const expressionTextVisitor: ExpressionTextVisitor = new ExpressionTextVisitor();
		expression = this.prepareExpression(expression);

		accept(expression, expressionTextVisitor);
		let expressionText = expressionTextVisitor.getExtpressionText()
		if(expression.kind === 'binary') {
			expressionText = this.replaceBinaryOperators(expressionText)
		}
		return this.replaceUnaryOperator(expressionText);
	}

	private replaceBinaryOperators(expressionText: string): string {
		return expressionText.replaceAll('and', '&&')
			.replaceAll('&', '&&')
			.replaceAll(' or ', ' || ')
			.replaceAll(' | ', ' || ')
			.replaceAll(' eq ', ' == ')
			.replaceAll(' neq ', ' != ')
			.replaceAll(' gt ', ' > ')
			.replaceAll(' gte ', ' >= ')
			.replaceAll(' lt ', ' < ')
			.replaceAll(' lte ', ' <= ');
	}

	private replaceUnaryOperator(expressionText: string): string {
		return expressionText.replaceAll(' not ', '!'); 
	}

	private prepareExpression(expression: ASTExpression) {
		switch(expression.kind) {
			case 'unary': expression = this.prepareUnary(expression as ASTUnary); break;
			case 'binary': expression = this.prepareBinary(expression as ASTBinary); break;
			case 'const': break; // nothing to do
			case 'enum': expression = this.prepareEnum(expression as ASTEnumValue); break;
			case 'instance': expression = this.prepareInstance(expression as ASTReference); break;
			case 'variable': expression = this.prepareInstance(expression as ASTReference); break;
			case 'robotAtPos': expression = this.prepareRobotAtPos(expression as ASTRobotAtPos); break;
			case 'expression_placeholder': break; // nothing to do
		}
		return expression;
	}

	private prepareUnary(expression: ASTUnary) {
		expression.operand = this.prepareExpression(expression.operand);
		return expression;
	}

	private prepareBinary(expression: ASTBinary) {
		expression.left = this.prepareExpression(expression.left);
		expression.right = this.prepareExpression(expression.right);
		return expression;
	}

	private prepareEnum(expression: ASTEnumValue) {
		expression.typeId = this.getNameOfId(expression.typeId);
		expression.typeId = this.removePackage(expression.typeId);
		return expression
	}

	private prepareInstance(expression: ASTReference) {
		if('instanceId' in expression && expression.instanceId) {
			expression.instanceId = this.getNameOfId(expression.instanceId);
			const refName = this.findMember(expression.instanceId);
			if(refName) {
				this.members.add(refName);
			}
			expression.instanceId = this.removePackage(expression.instanceId);
		}
			
		return expression;
	}

	private prepareRobotAtPos(expression: ASTRobotAtPos) {
		expression.id = this.getNameOfId(expression.id);
		expression.value = this.prepareInstance(expression.value as ASTReference) as ASTInstanceReference;
		return expression;
	}

	// returns id after last =
	private getNameOfId(id: string) {
		return id.slice(id.lastIndexOf('=') + 1)
	} 

	private addInputs(functionDef: FunctionDefinition) {
		functionDef.input?.forEach((input: Argument & ASTNode) => 
			this.functionDefs.get(this.getNameOfId((functionDef as FunctionDefinition).id))
			?.push(`${this.getNameOfId(input.typeId)} ${this.getNameOfId(input.id)}`));
	}

	private removePackage(name: string) {
		return name.slice(name.indexOf('.') + 1);
	} 
}
