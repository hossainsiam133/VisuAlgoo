import { useEffect, useRef, useState } from 'react';

const DEFAULT_VALUES = '4, 12, 9, 6, 18';
const RUN_DELAY_MS = 700;

function DoubleList({ onBack }) {
	const [inputText, setInputText] = useState(DEFAULT_VALUES);
	const [nodes, setNodes] = useState(buildNodes(parseListInput(DEFAULT_VALUES).values));
	const [valueText, setValueText] = useState('11');
	const [positionText, setPositionText] = useState('2');
	const [searchText, setSearchText] = useState('6');
	const [searchDirection, setSearchDirection] = useState('forward');
	const [visited, setVisited] = useState([]);
	const [activeIndex, setActiveIndex] = useState(getInitialActiveIndex('forward', nodes.length));
	const [foundIndex, setFoundIndex] = useState(null);
	const [status, setStatus] = useState('Ready to visualize the list.');
	const idRef = useRef(nodes.length + 1);
	const visitedRef = useRef(visited);
	const activeRef = useRef(activeIndex);
	const foundRef = useRef(foundIndex);
	const nodesRef = useRef(nodes);
	const runRef = useRef({ timer: null, target: null });

	useEffect(() => {
		visitedRef.current = visited;
	}, [visited]);

	useEffect(() => {
		activeRef.current = activeIndex;
	}, [activeIndex]);

	useEffect(() => {
		foundRef.current = foundIndex;
	}, [foundIndex]);

	useEffect(() => {
		nodesRef.current = nodes;
	}, [nodes]);

	useEffect(() => () => stopRun(), []);

	const stopRun = () => {
		if (runRef.current.timer) {
			clearTimeout(runRef.current.timer);
			runRef.current.timer = null;
		}
		runRef.current.running = false;
	};

	const resetHighlights = (direction = searchDirection, length = nodesRef.current.length) => {
		setVisited([]);
		setFoundIndex(null);
		setActiveIndex(getInitialActiveIndex(direction, length));
	};

	const handleApplyValues = () => {
		stopRun();
		const parsed = parseListInput(inputText).values;
		if (!parsed.length) {
			setStatus('Enter at least one valid value.');
			return;
		}
		const nextNodes = buildNodes(parsed);
		idRef.current = nextNodes.length + 1;
		setNodes(nextNodes);
		resetHighlights(searchDirection, nextNodes.length);
		setStatus('Values updated.');
	};

	const handleRandomize = () => {
		stopRun();
		const length = 4 + Math.floor(Math.random() * 5);
		const values = Array.from({ length }, () => Math.floor(Math.random() * 25) + 1);
		setInputText(values.join(', '));
		const nextNodes = buildNodes(values);
		idRef.current = nextNodes.length + 1;
		setNodes(nextNodes);
		resetHighlights(searchDirection, nextNodes.length);
		setStatus('Random list generated.');
	};

	const handleInsertHead = () => {
		stopRun();
		const value = parseNumber(valueText);
		if (value === null) {
			setStatus('Enter a valid value to insert.');
			return;
		}
		setNodes((prev) => [{ id: idRef.current++, value }, ...prev]);
		resetHighlights();
		setStatus(`Inserted ${value} at the head.`);
	};

	const handleInsertTail = () => {
		stopRun();
		const value = parseNumber(valueText);
		if (value === null) {
			setStatus('Enter a valid value to insert.');
			return;
		}
		setNodes((prev) => [...prev, { id: idRef.current++, value }]);
		resetHighlights();
		setStatus(`Inserted ${value} at the tail.`);
	};

	const handleInsertAt = () => {
		stopRun();
		const value = parseNumber(valueText);
		const position = parseNumber(positionText);
		if (value === null || position === null) {
			setStatus('Enter a valid value and position.');
			return;
		}
		if (position < 0 || position > nodesRef.current.length) {
			setStatus('Position is out of range.');
			return;
		}
		setNodes((prev) => {
			const next = [...prev];
			next.splice(position, 0, { id: idRef.current++, value });
			return next;
		});
		resetHighlights();
		setStatus(`Inserted ${value} at position ${position}.`);
	};

	const handleDeleteHead = () => {
		stopRun();
		if (!nodesRef.current.length) {
			setStatus('List is already empty.');
			return;
		}
		const [removed] = nodesRef.current;
		setNodes((prev) => prev.slice(1));
		resetHighlights();
		setStatus(`Removed head node (${removed.value}).`);
	};

	const handleDeleteTail = () => {
		stopRun();
		if (!nodesRef.current.length) {
			setStatus('List is already empty.');
			return;
		}
		const removed = nodesRef.current[nodesRef.current.length - 1];
		setNodes((prev) => prev.slice(0, -1));
		resetHighlights();
		setStatus(`Removed tail node (${removed.value}).`);
	};

	const handleDeleteValue = () => {
		stopRun();
		const value = parseNumber(valueText);
		if (value === null) {
			setStatus('Enter a valid value to delete.');
			return;
		}
		const index = nodesRef.current.findIndex((node) => node.value === value);
		if (index === -1) {
			setStatus(`Value ${value} not found.`);
			return;
		}
		setNodes((prev) => prev.filter((_, idx) => idx !== index));
		resetHighlights();
		setStatus(`Removed first occurrence of ${value} at position ${index}.`);
	};

	const handleSearchDirection = (event) => {
		const nextDirection = event.target.value;
		setSearchDirection(nextDirection);
		resetHighlights(nextDirection, nodesRef.current.length);
		setStatus(`Search direction set to ${nextDirection}.`);
	};

	const handleSearchStep = () => {
		stopRun();
		const target = parseNumber(searchText);
		if (!nodesRef.current.length || target === null) {
			setStatus('Enter a valid search value.');
			return;
		}
		if (foundRef.current !== null) {
			setStatus(`Value found at position ${foundRef.current}.`);
			return;
		}

		const nextIndex = getNextIndex(searchDirection, activeRef.current);
		if (isSearchComplete(searchDirection, nextIndex, nodesRef.current.length)) {
			setStatus('Search complete. Value not found.');
			return;
		}

		setActiveIndex(nextIndex);
		setVisited([...visitedRef.current, nextIndex]);

		if (nodesRef.current[nextIndex].value === target) {
			setFoundIndex(nextIndex);
			setStatus(`Found ${target} at position ${nextIndex}.`);
		} else {
			setStatus(`Checking node ${nextIndex}...`);
		}
	};

	const handleSearchRun = () => {
		const target = parseNumber(searchText);
		if (!nodesRef.current.length || target === null) {
			setStatus('Enter a valid search value.');
			return;
		}
		stopRun();
		runRef.current.running = true;
		runRef.current.target = target;
		setStatus('Searching the list...');
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const runStep = () => {
		const target = runRef.current.target;
		if (!nodesRef.current.length || target === null) {
			setStatus('Enter a valid search value.');
			stopRun();
			return;
		}
		if (foundRef.current !== null) {
			setStatus(`Found ${target} at position ${foundRef.current}.`);
			stopRun();
			return;
		}

		const nextIndex = getNextIndex(searchDirection, activeRef.current);
		if (isSearchComplete(searchDirection, nextIndex, nodesRef.current.length)) {
			setStatus('Search complete. Value not found.');
			stopRun();
			return;
		}

		setActiveIndex(nextIndex);
		setVisited([...visitedRef.current, nextIndex]);

		if (nodesRef.current[nextIndex].value === target) {
			setFoundIndex(nextIndex);
			setStatus(`Found ${target} at position ${nextIndex}.`);
			stopRun();
			return;
		}

		setStatus(`Checking node ${nextIndex}...`);
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const handleResetSearch = () => {
		stopRun();
		resetHighlights();
		setStatus('Search reset.');
	};

	const handleResetList = () => {
		stopRun();
		const nextNodes = buildNodes(parseListInput(DEFAULT_VALUES).values);
		idRef.current = nextNodes.length + 1;
		setNodes(nextNodes);
		setInputText(DEFAULT_VALUES);
		resetHighlights(searchDirection, nextNodes.length);
		setStatus('List reset to defaults.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Doubly Linked List</div>
						<div className="array-meta">Nodes link to both previous and next nodes</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Linked List
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is a Doubly Linked List?</h3>
						<p>Each node stores a value, a next pointer, and a previous pointer.</p>
					</div>
					<div className="info-card">
						<h3>Why Use It?</h3>
						<p>Traversal works in both directions, making deletions and reversals easier.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithm Steps</div>
					<ol className="steps-list">
						<li>Start at the head or tail node.</li>
						<li>Follow next or previous pointers to traverse.</li>
						<li>Stop when the value is found or the end is reached.</li>
					</ol>
				</div>

				<div className="section-block">
					<div className="section-title">Time Complexity</div>
					<div className="complexity-graph">
						<div className="graph-bar">
							<span>O(1)</span>
						</div>
						<div className="graph-bar">
							<span>O(log n)</span>
						</div>
						<div className="graph-bar active">
							<span>O(n)</span>
						</div>
						<div className="graph-bar">
							<span>O(n log n)</span>
						</div>
						<div className="graph-bar">
							<span>O(n^2)</span>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">List Builder</div>
					<div className="array-controls">
						<div className="control-field">
							<label>List values</label>
							<input
								type="text"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 4, 8, 2"
							/>
						</div>
						<div className="control-field">
							<label>Node value</label>
							<input
								type="number"
								value={valueText}
								onChange={(event) => setValueText(event.target.value)}
								placeholder="e.g. 11"
							/>
						</div>
						<div className="control-field">
							<label>Position</label>
							<input
								type="number"
								value={positionText}
								onChange={(event) => setPositionText(event.target.value)}
								placeholder="0-based index"
							/>
						</div>
						<div className="control-field">
							<label>Search for</label>
							<input
								type="number"
								value={searchText}
								onChange={(event) => setSearchText(event.target.value)}
								placeholder="e.g. 6"
							/>
						</div>
						<div className="control-field">
							<label>Search direction</label>
							<select value={searchDirection} onChange={handleSearchDirection}>
								<option value="forward">Forward (head to tail)</option>
								<option value="backward">Backward (tail to head)</option>
							</select>
						</div>
					</div>

					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleApplyValues}>
							Apply Values
						</button>
						<button className="array-btn" type="button" onClick={handleRandomize}>
							Randomize
						</button>
						<button className="array-btn" type="button" onClick={handleInsertHead}>
							Insert Head
						</button>
						<button className="array-btn" type="button" onClick={handleInsertTail}>
							Insert Tail
						</button>
						<button className="array-btn" type="button" onClick={handleInsertAt}>
							Insert At
						</button>
						<button className="array-btn" type="button" onClick={handleDeleteHead}>
							Delete Head
						</button>
						<button className="array-btn" type="button" onClick={handleDeleteTail}>
							Delete Tail
						</button>
						<button className="array-btn" type="button" onClick={handleDeleteValue}>
							Delete Value
						</button>
						<button className="array-btn" type="button" onClick={handleSearchStep}>
							Search Step
						</button>
						<button className="array-btn" type="button" onClick={handleSearchRun}>
							Run Search
						</button>
						<button className="array-btn" type="button" onClick={handleResetSearch}>
							Reset Search
						</button>
						<button className="array-btn" type="button" onClick={handleResetList}>
							Reset List
						</button>
					</div>

					<div className="array-status">{status}</div>

					<div className="list-viz">
						{nodes.length === 0 ? (
							<div className="list-empty">List is empty.</div>
						) : (
							nodes.map((node, index) => {
								const isActive = index === activeIndex;
								const isVisited = visited.includes(index);
								const isFound = index === foundIndex;
								const prevAddress = index === 0 ? 'null' : formatAddress(nodes[index - 1].id);
								const nextAddress =
									index === nodes.length - 1 ? 'null' : formatAddress(nodes[index + 1].id);
								return (
									<div className="list-node-group" key={node.id}>
										<div
											className={`viz-cell list-node ${
												isFound ? 'found' : isActive || isVisited ? 'active' : ''
											}`}
										>
											<div className="viz-index">{formatAddress(node.id)}</div>
											<div className="viz-value">{node.value}</div>
											<div className="list-meta">
												<span>prev: {prevAddress}</span>
												<span>next: {nextAddress}</span>
											</div>
										</div>
										<span className="list-arrow">&lt;-&gt;</span>
									</div>
								);
							})
						)}
						{nodes.length > 0 && <span className="list-null">null</span>}
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Implementation Code in C++</div>
					<pre className="code-block">
						<code>{`struct Node {
	int value;
	Node* prev;
	Node* next;
};

Node* insertHead(Node* head, int value) {
	Node* node = new Node{value, nullptr, head};
	if (head != nullptr) {
		head->prev = node;
	}
	return node;
}

int searchForward(Node* head, int target) {
	int index = 0;
	for (Node* cur = head; cur != nullptr; cur = cur->next) {
		if (cur->value == target) return index;
		index++;
	}
	return -1;
}`}</code>
					</pre>
				</div>
			</div>
		</div>
	);
}

function parseListInput(text) {
	const tokens = text.split(/[,\s]+/).filter(Boolean);
	const values = tokens
		.map((token) => Number.parseInt(token, 10))
		.filter((value) => Number.isFinite(value));
	return { values };
}

function parseNumber(text) {
	const value = Number.parseInt(text, 10);
	return Number.isFinite(value) ? value : null;
}

function buildNodes(values) {
	return values.map((value, index) => ({ id: index + 1, value }));
}

function formatAddress(id) {
	const base = 0x2000;
	const offset = id * 0x10;
	return `0x${(base + offset).toString(16).toUpperCase()}`;
}

function getInitialActiveIndex(direction, length) {
	return direction === 'forward' ? -1 : length;
}

function getNextIndex(direction, currentIndex) {
	return direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
}

function isSearchComplete(direction, nextIndex, length) {
	return direction === 'forward' ? nextIndex >= length : nextIndex < 0;
}

export default DoubleList;
