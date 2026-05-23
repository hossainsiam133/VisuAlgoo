import { useMemo, useState } from 'react';

const DEFAULT_NODE_COUNT = 5;
const DEFAULT_EDGES = [
	{ from: 0, to: 1, weight: 1 },
	{ from: 0, to: 2, weight: 1 },
	{ from: 1, to: 3, weight: 1 },
	{ from: 2, to: 4, weight: 1 },
];

function AdjacencyMatrix({ onBack }) {
	const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT);
	const [directed, setDirected] = useState(false);
	const [weighted, setWeighted] = useState(false);
	const [fromText, setFromText] = useState('A');
	const [toText, setToText] = useState('C');
	const [weightText, setWeightText] = useState('2');
	const [matrix, setMatrix] = useState(buildMatrix(DEFAULT_NODE_COUNT, DEFAULT_EDGES, false));
	const [status, setStatus] = useState('Add edges to build the adjacency matrix.');

	const labels = useMemo(() => Array.from({ length: nodeCount }, (_, index) => labelFromIndex(index)), [nodeCount]);
	const edgeList = useMemo(() => matrixToEdges(matrix, directed), [matrix, directed]);
	const graphLayout = useMemo(
		() => buildGraphLayout(labels, matrix, directed),
		[labels, matrix, directed]
	);

	const handleNodeCount = (event) => {
		const value = Number.parseInt(event.target.value, 10);
		if (!Number.isFinite(value) || value < 2) {
			setStatus('Enter a node count of at least 2.');
			return;
		}
		setNodeCount(value);
		setMatrix(buildEmptyMatrix(value));
		setStatus('Matrix resized. Add edges again.');
	};

	const handleToggleDirected = () => {
		const nextDirected = !directed;
		setDirected(nextDirected);
		if (!nextDirected) {
			setMatrix((prev) => makeSymmetric(prev));
			setStatus('Switched to undirected. Matrix mirrored.');
		} else {
			setStatus('Switched to directed.');
		}
	};

	const handleToggleWeighted = () => {
		const nextWeighted = !weighted;
		setWeighted(nextWeighted);
		if (!nextWeighted) {
			setMatrix((prev) => normalizeWeights(prev));
			setStatus('Switched to unweighted. Weights set to 1.');
		} else {
			setStatus('Switched to weighted.');
		}
	};

	const handleAddEdge = () => {
		const from = parseVertex(fromText, nodeCount);
		const to = parseVertex(toText, nodeCount);
		if (from === null || to === null) {
			setStatus('Enter valid vertices (e.g. A, B, 1, 2).');
			return;
		}
		const weight = weighted ? parseWeight(weightText) : 1;
		if (weight === null) {
			setStatus('Enter a valid weight (positive number).');
			return;
		}
		setMatrix((prev) => applyEdge(prev, from, to, weight, directed));
		setStatus(`Edge ${labelFromIndex(from)} -> ${labelFromIndex(to)} added.`);
	};

	const handleRemoveEdge = () => {
		const from = parseVertex(fromText, nodeCount);
		const to = parseVertex(toText, nodeCount);
		if (from === null || to === null) {
			setStatus('Enter valid vertices (e.g. A, B, 1, 2).');
			return;
		}
		setMatrix((prev) => removeEdge(prev, from, to, directed));
		setStatus(`Edge ${labelFromIndex(from)} -> ${labelFromIndex(to)} removed.`);
	};

	const handleRandomize = () => {
		const next = buildRandomMatrix(nodeCount, directed, weighted);
		setMatrix(next);
		setStatus('Random edges generated.');
	};

	const handleClear = () => {
		setMatrix(buildEmptyMatrix(nodeCount));
		setStatus('Matrix cleared.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Adjacency Matrix</div>
						<div className="array-meta">Grid-based graph representation</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Graph
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is an Adjacency Matrix?</h3>
						<p>A square matrix where cell (i, j) shows if there is an edge from node i to node j.</p>
					</div>
					<div className="info-card">
						<h3>Best For</h3>
						<p>Dense graphs and quick edge lookup with O(1) access time.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Controls</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Nodes</label>
							<input
								type="number"
								min="2"
								value={nodeCount}
								onChange={handleNodeCount}
							/>
						</div>
						<div className="control-field">
							<label>From</label>
							<input
								type="text"
								value={fromText}
								onChange={(event) => setFromText(event.target.value)}
								placeholder="A"
							/>
						</div>
						<div className="control-field">
							<label>To</label>
							<input
								type="text"
								value={toText}
								onChange={(event) => setToText(event.target.value)}
								placeholder="B"
							/>
						</div>
						<div className="control-field">
							<label>Weight</label>
							<input
								type="number"
								value={weightText}
								onChange={(event) => setWeightText(event.target.value)}
								disabled={!weighted}
								placeholder="1"
							/>
						</div>
					</div>

					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleAddEdge}>
							Add Edge
						</button>
						<button className="array-btn" type="button" onClick={handleRemoveEdge}>
							Remove Edge
						</button>
						<button className="array-btn" type="button" onClick={handleRandomize}>
							Randomize
						</button>
						<button className="array-btn" type="button" onClick={handleClear}>
							Clear Matrix
						</button>
						<button className="array-btn" type="button" onClick={handleToggleDirected}>
							{directed ? 'Directed' : 'Undirected'}
						</button>
						<button className="array-btn" type="button" onClick={handleToggleWeighted}>
							{weighted ? 'Weighted' : 'Unweighted'}
						</button>
					</div>

					<div className="array-status">{status}</div>
				</div>

				<div className="section-block">
					<div className="section-title">Adjacency Matrix</div>
					<div className="matrix-scroll">
						<table className="array-table matrix-table">
							<thead>
								<tr>
									<th />
									{labels.map((label) => (
										<th key={label}>{label}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{matrix.map((row, rowIndex) => (
									<tr key={labels[rowIndex]}>
										<th>{labels[rowIndex]}</th>
										{row.map((value, colIndex) => (
											<td
												key={`${rowIndex}-${colIndex}`}
												className={`matrix-cell ${value ? 'matrix-cell-active' : 'matrix-cell-zero'}`}
											>
												{value}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Graph View</div>
					<div className="graph-shell">
						<svg className="graph-canvas" viewBox="0 0 520 360" role="img" aria-label="Graph visualization">
							<defs>
								<marker
									id="arrowhead"
									markerWidth="12"
									markerHeight="9"
									refX="11"
									refY="3.5"
									markerUnits="strokeWidth"
									orient="auto"
								>
									<polygon points="0 0, 12 3.5, 0 7" />
								</marker>
							</defs>

							{graphLayout.edges.map((edge) => (
								<g key={edge.id}>
									<line
										className={`graph-edge ${edge.weight ? 'graph-edge-active' : ''}`}
										x1={edge.line.from.x}
										y1={edge.line.from.y}
										x2={edge.line.to.x}
										y2={edge.line.to.y}
										markerEnd={directed ? 'url(#arrowhead)' : undefined}
									/>
									{edge.weight !== null && weighted && (
										<text className="graph-weight" x={edge.label.x} y={edge.label.y}>
											{edge.weight}
										</text>
									)}
								</g>
							))}

							{graphLayout.nodes.map((node) => (
								<g key={node.id}>
									<circle className="graph-node" cx={node.x} cy={node.y} r="18" />
									<text className="graph-node-label" x={node.x} y={node.y}>
										{node.label}
									</text>
								</g>
							))}
						</svg>
						<div className="graph-legend">
							<span className="graph-legend-item">Nodes placed on a ring</span>
							<span className="graph-legend-item">Edges show direction and weight</span>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Edges</div>
					<div className="edge-list">
						{edgeList.length === 0 ? (
							<span className="list-empty">No edges yet.</span>
						) : (
							edgeList.map((edge) => (
								<span className="edge-chip" key={edge.id}>
									{edge.label}
								</span>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function buildEmptyMatrix(size) {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}

function buildMatrix(size, edges, directed) {
	const matrix = buildEmptyMatrix(size);
	edges.forEach(({ from, to, weight }) => {
		matrix[from][to] = weight;
		if (!directed) {
			matrix[to][from] = weight;
		}
	});
	return matrix;
}

function applyEdge(matrix, from, to, weight, directed) {
	const next = matrix.map((row) => [...row]);
	next[from][to] = weight;
	if (!directed) {
		next[to][from] = weight;
	}
	return next;
}

function removeEdge(matrix, from, to, directed) {
	const next = matrix.map((row) => [...row]);
	next[from][to] = 0;
	if (!directed) {
		next[to][from] = 0;
	}
	return next;
}

function makeSymmetric(matrix) {
	const size = matrix.length;
	const next = matrix.map((row) => [...row]);
	for (let i = 0; i < size; i += 1) {
		for (let j = i + 1; j < size; j += 1) {
			const value = Math.max(next[i][j], next[j][i]);
			next[i][j] = value;
			next[j][i] = value;
		}
	}
	return next;
}

function normalizeWeights(matrix) {
	return matrix.map((row) => row.map((value) => (value ? 1 : 0)));
}

function buildRandomMatrix(size, directed, weighted) {
	const matrix = buildEmptyMatrix(size);
	const density = size <= 4 ? 0.4 : 0.3;
	for (let i = 0; i < size; i += 1) {
		for (let j = 0; j < size; j += 1) {
			if (i === j) continue;
			if (Math.random() > density) continue;
			const weight = weighted ? 1 + Math.floor(Math.random() * 9) : 1;
			matrix[i][j] = weight;
			if (!directed) {
				matrix[j][i] = weight;
			}
		}
	}
	return matrix;
}

function parseVertex(text, size) {
	if (!text) return null;
	const trimmed = text.trim();
	const number = Number.parseInt(trimmed, 10);
	if (Number.isFinite(number)) {
		if (number >= 0 && number < size) return number;
		if (number >= 1 && number <= size) return number - 1;
	}
	const upper = trimmed.toUpperCase();
	const match = upper.match(/^[A-Z]+$/);
	if (!match) return null;
	let value = 0;
	for (let i = 0; i < upper.length; i += 1) {
		value = value * 26 + (upper.charCodeAt(i) - 64);
	}
	const index = value - 1;
	return index >= 0 && index < size ? index : null;
}

function parseWeight(text) {
	const value = Number.parseInt(text, 10);
	return Number.isFinite(value) && value > 0 ? value : null;
}

function labelFromIndex(index) {
	let value = index + 1;
	let label = '';
	while (value > 0) {
		const remainder = (value - 1) % 26;
		label = String.fromCharCode(65 + remainder) + label;
		value = Math.floor((value - 1) / 26);
	}
	return label;
}

function matrixToEdges(matrix, directed) {
	const edges = [];
	for (let i = 0; i < matrix.length; i += 1) {
		for (let j = 0; j < matrix.length; j += 1) {
			if (!matrix[i][j]) continue;
			if (!directed && j < i) continue;
			const from = labelFromIndex(i);
			const to = labelFromIndex(j);
			const weight = matrix[i][j];
			edges.push({
				id: `${i}-${j}`,
				label: `${from} ${directed ? '->' : '<->'} ${to} (${weight})`,
			});
		}
	}
	return edges;
}

function buildGraphLayout(labels, matrix, directed) {
	const size = 520;
	const height = 360;
	const center = { x: size / 2, y: height / 2 };
	const radius = Math.min(center.x, center.y) - 60;
	const nodeRadius = 18;
	const arrowPadding = directed ? 1 : 0;
	const nodes = labels.map((label, index) => {
		const angle = (-90 + (360 / labels.length) * index) * (Math.PI / 180);
		return {
			id: label,
			label,
			x: center.x + Math.cos(angle) * radius,
			y: center.y + Math.sin(angle) * radius,
		};
	});

	const edges = [];
	for (let i = 0; i < labels.length; i += 1) {
		for (let j = 0; j < labels.length; j += 1) {
			if (i === j) continue;
			const weight = matrix[i][j];
			if (!weight) continue;
			if (!directed && j < i) continue;
			const from = nodes[i];
			const to = nodes[j];
			const line = trimLine(from, to, nodeRadius, arrowPadding);
			const midX = (from.x + to.x) / 2;
			const midY = (from.y + to.y) / 2;
			const offset = directed ? 12 : 0;
			edges.push({
				id: `${labels[i]}-${labels[j]}`,
				from,
				to,
				line,
				weight,
				label: { x: midX + offset, y: midY - offset },
			});
		}
	}

	return { nodes, edges };
}

function trimLine(from, to, nodeRadius, arrowPadding) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const distance = Math.hypot(dx, dy) || 1;
	const startOffset = nodeRadius + 2;
	const endOffset = nodeRadius + arrowPadding;
	return {
		from: {
			x: from.x + (dx / distance) * startOffset,
			y: from.y + (dy / distance) * startOffset,
		},
		to: {
			x: to.x - (dx / distance) * endOffset,
			y: to.y - (dy / distance) * endOffset,
		},
	};
}

export default AdjacencyMatrix;