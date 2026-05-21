import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_EXPRESSION = 'A + B * (C - D) / E';
const RUN_DELAY_MS = 2000;
const OPERATORS = {
	'+': { precedence: 1, assoc: 'L' },
	'-': { precedence: 1, assoc: 'L' },
	'*': { precedence: 2, assoc: 'L' },
	'/': { precedence: 2, assoc: 'L' },
	'^': { precedence: 3, assoc: 'R' }
};

function Postfix({ onBack }) {
	const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
	const [tokens, setTokens] = useState(tokenizeExpression(DEFAULT_EXPRESSION).tokens);
	const [steps, setSteps] = useState([]);
	const [stepIndex, setStepIndex] = useState(-1);
	const [status, setStatus] = useState('Enter an infix expression and click Apply.');
	const runRef = useRef({ running: false, timer: null });

	useEffect(() => () => stopRun(), []);

	const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
	const currentTokenIndex = currentStep ? currentStep.tokenIndex : -1;
	const stackView = useMemo(() => {
		const stackNow = currentStep ? currentStep.stack : [];
		return [...stackNow]
			.map((value, index) => ({ value, index, isTop: index === stackNow.length - 1 }))
			.reverse();
	}, [currentStep]);
	const outputView = currentStep ? currentStep.output : [];
	const logEntries = steps.slice(0, stepIndex + 1).map((step) => step.log);
	const postfixText = steps.length ? steps[steps.length - 1].output.join(' ') : '';

	const stopRun = () => {
		if (runRef.current.timer) {
			clearTimeout(runRef.current.timer);
			runRef.current.timer = null;
		}
		runRef.current.running = false;
	};

	const handleApply = () => {
		stopRun();
		const parsed = tokenizeExpression(expression);
		if (parsed.error) {
			setStatus(parsed.error);
			setTokens([]);
			setSteps([]);
			setStepIndex(-1);
			return;
		}
		if (!parsed.tokens.length) {
			setStatus('Enter a valid infix expression.');
			setTokens([]);
			setSteps([]);
			setStepIndex(-1);
			return;
		}
		const conversion = buildConversionSteps(parsed.tokens);
		if (conversion.error) {
			setStatus(conversion.error);
			setTokens(parsed.tokens);
			setSteps([]);
			setStepIndex(-1);
			return;
		}
		setTokens(parsed.tokens);
		setSteps(conversion.steps);
		setStepIndex(-1);
		setStatus('Expression ready. Click Next Step to begin.');
	};

	const handleStep = () => {
		stopRun();
		if (!steps.length) {
			setStatus('Apply a valid expression first.');
			return;
		}
		const nextIndex = stepIndex + 1;
		if (nextIndex >= steps.length) {
			setStatus('Conversion complete.');
			return;
		}
		setStepIndex(nextIndex);
		setStatus(steps[nextIndex].log);
	};

	const runStep = () => {
		if (!runRef.current.running) {
			return;
		}
		setStepIndex((prev) => {
			const nextIndex = prev + 1;
			if (nextIndex >= steps.length) {
				setStatus('Conversion complete.');
				stopRun();
				return prev;
			}
			setStatus(steps[nextIndex].log);
			runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
			return nextIndex;
		});
	};

	const handleRun = () => {
		if (!steps.length) {
			setStatus('Apply a valid expression first.');
			return;
		}
		stopRun();
		runRef.current.running = true;
		setStatus('Running conversion...');
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const handleReset = () => {
		stopRun();
		setExpression(DEFAULT_EXPRESSION);
		const parsed = tokenizeExpression(DEFAULT_EXPRESSION);
		setTokens(parsed.tokens);
		const conversion = buildConversionSteps(parsed.tokens);
		setSteps(conversion.steps || []);
		setStepIndex(-1);
		setStatus('Reset to default expression. Click Next Step to begin.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Postfix Notation</div>
						<div className="array-meta">Convert infix expressions using a stack</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Stack
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Postfix Notation?</h3>
						<p>
							Postfix (Reverse Polish) notation writes operators after operands, so A + B becomes A B +.
							It removes parentheses and can be evaluated with a simple stack.
						</p>
					</div>
					<div className="info-card">
						<h3>Why Use It?</h3>
						<p>
							Postfix expressions are unambiguous. A single left-to-right scan can evaluate them using stack
							operations.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Infix to Postfix Conversion Steps</div>
					<ol className="steps-list">
						<li>Scan tokens from left to right.</li>
						<li>Send operands directly to output.</li>
						<li>Push operators onto the stack, popping higher/equal precedence operators first.</li>
						<li>Push ( onto the stack; on ), pop until ( is removed.</li>
						<li>After scanning, pop any remaining operators to output.</li>
					</ol>
				</div>

				<div className="section-block">
					<div className="section-title">Operator Precedence Table</div>
					<div className="info-card">
						<table className="array-table">
							<thead>
								<tr>
									<th>Operator</th>
									<th>Precedence</th>
									<th>Associativity</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>^</td>
									<td>3</td>
									<td>Right</td>
								</tr>
								<tr>
									<td>* /</td>
									<td>2</td>
									<td>Left</td>
								</tr>
								<tr>
									<td>+ -</td>
									<td>1</td>
									<td>Left</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Visualize the Conversion</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Infix expression</label>
							<input
								type="text"
								value={expression}
								onChange={(event) => setExpression(event.target.value)}
								placeholder="e.g. A + B * (C - D)"
							/>
						</div>
						<div className="control-field">
							<label>Current postfix</label>
							<input type="text" value={currentStep ? outputView.join(' ') : ''} readOnly />
						</div>
					</div>
					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleApply}>
							Apply Expression
						</button>
						<button className="array-btn" type="button" onClick={handleStep}>
							Next Step
						</button>
						<button className="array-btn" type="button" onClick={handleRun}>
							Run Conversion
						</button>
						<button className="array-btn" type="button" onClick={handleReset}>
							Reset
						</button>
					</div>
					<div className="array-status">{status}</div>
					<div className="info-grid">
						<div className="info-card">
							<h3>Tokens</h3>
							<div className="viz-array">
								{tokens.length ? (
									tokens.map((token, index) => (
										<div
											key={`${token}-${index}`}
											className={`viz-cell ${index === currentTokenIndex ? 'active' : ''}`}
										>
											<div className="viz-value">{token}</div>
										</div>
									))
								) : (
									<div className="stack-empty">No tokens parsed.</div>
								)}
							</div>
						</div>
						<div className="info-card">
							<h3>Operator Stack</h3>
							<div className="stack-viz">
								{stackView.length ? (
									stackView.map(({ value, index, isTop }) => (
										<div
											key={`${value}-${index}`}
											className={`stack-item ${isTop ? 'top' : ''}`}
										>
											<div className="stack-value">{value}</div>
										</div>
									))
								) : (
									<div className="stack-empty">Stack is empty.</div>
								)}
							</div>
						</div>
						<div className="info-card">
							<h3>Output</h3>
							<div className="viz-array">
								{outputView.length ? (
									outputView.map((token, index) => (
										<div key={`${token}-${index}`} className="viz-cell">
											<div className="viz-value">{token}</div>
										</div>
									))
								) : (
									<div className="stack-empty">Output is empty.</div>
								)}
							</div>
						</div>
					</div>
					<div className="stack-meta">
						<span>Total steps: {steps.length}</span>
						<span>Current step: {stepIndex + 1}</span>
						<span>Final postfix: {postfixText || '-'}</span>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Conversion Steps Logs</div>
					{logEntries.length ? (
						<ol className="steps-list">
							{logEntries.map((entry, index) => (
								<li key={`${entry}-${index}`}>{entry}</li>
							))}
						</ol>
					) : (
						<div className="stack-empty">No steps yet. Apply an expression and start stepping.</div>
					)}
				</div>
			</div>
		</div>
	);
}

function tokenizeExpression(expression) {
	const tokens = [];
	let index = 0;
	while (index < expression.length) {
		const char = expression[index];
		if (char.trim() === '') {
			index += 1;
			continue;
		}
		if (/[A-Za-z]/.test(char)) {
			let start = index;
			index += 1;
			while (index < expression.length && /[A-Za-z0-9_]/.test(expression[index])) {
				index += 1;
			}
			tokens.push(expression.slice(start, index));
			continue;
		}
		if (/[0-9]/.test(char)) {
			let start = index;
			let hasDot = false;
			index += 1;
			while (index < expression.length && /[0-9.]/.test(expression[index])) {
				if (expression[index] === '.') {
					if (hasDot) {
						break;
					}
					hasDot = true;
				}
				index += 1;
			}
			tokens.push(expression.slice(start, index));
			continue;
		}
		if (isOperator(char) || char === '(' || char === ')') {
			tokens.push(char);
			index += 1;
			continue;
		}
		return { tokens: [], error: `Invalid character "${char}" in expression.` };
	}
	return { tokens };
}

function buildConversionSteps(tokens) {
	const output = [];
	const stack = [];
	const steps = [];

	const pushStep = (tokenIndex, token, message) => {
		steps.push({
			tokenIndex,
			token,
			stack: [...stack],
			output: [...output],
			log: message
		});
	};

	for (let i = 0; i < tokens.length; i += 1) {
		const token = tokens[i];
		if (isOperand(token)) {
			output.push(token);
			pushStep(i, token, `Read operand ${token} -> append to output.`);
			continue;
		}
		if (token === '(') {
			stack.push(token);
			pushStep(i, token, 'Push ( onto the stack.');
			continue;
		}
		if (token === ')') {
			let foundLeft = false;
			while (stack.length) {
				const top = stack.pop();
				if (top === '(') {
					foundLeft = true;
					pushStep(i, token, 'Discard ( from the stack.');
					break;
				}
				output.push(top);
				pushStep(i, token, `Pop ${top} from stack -> output until (.`);
			}
			if (!foundLeft) {
				return { error: 'Mismatched parentheses: missing (.' };
			}
			continue;
		}
		if (isOperator(token)) {
			while (stack.length && isOperator(stack[stack.length - 1])) {
				const top = stack[stack.length - 1];
				const topInfo = OPERATORS[top];
				const currentInfo = OPERATORS[token];
				const shouldPop =
					topInfo.precedence > currentInfo.precedence ||
					(topInfo.precedence === currentInfo.precedence && currentInfo.assoc === 'L');
				if (!shouldPop) {
					break;
				}
				output.push(stack.pop());
				pushStep(i, token, `Pop ${top} from stack -> output (precedence rule).`);
			}
			stack.push(token);
			pushStep(i, token, `Push operator ${token} onto the stack.`);
			continue;
		}
		return { error: `Unrecognized token: ${token}.` };
	}

	while (stack.length) {
		const top = stack.pop();
		if (top === '(') {
			return { error: 'Mismatched parentheses: missing ).' };
		}
		output.push(top);
		pushStep(tokens.length - 1, top, `Pop remaining ${top} from stack -> output.`);
	}

	return { steps, postfix: output.join(' ') };
}

function isOperator(token) {
	return Object.prototype.hasOwnProperty.call(OPERATORS, token);
}

function isOperand(token) {
	return !isOperator(token) && token !== '(' && token !== ')';
}

export default Postfix;
