import { useMemo, useState } from 'react';

const DEFAULT_NODE_COUNT = 5;
const DEFAULT_EDGES = [
	{ from: 0, to: 1, weight: 1 },
	{ from: 0, to: 2, weight: 1 },
	{ from: 1, to: 3, weight: 1 },
	{ from: 2, to: 4, weight: 1 },
];

function AdjacencyList({ onBack }) {
	const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT);
	const [directed, setDirected] = useState(false);
	const [weighted, setWeighted] = useState(false);
	const [fromText, setFromText] = useState('A');
	const [toText, setToText] = useState('C');
	const [weightText, setWeightText] = useState('2');
	const [adjList, setAdjList] = useState(buildAdjList(DEFAULT_NODE_COUNT, DEFAULT_EDGES, false));
	const [status, setStatus] = useState('Add edges to build the adjacency list.');

	const labels = useMemo(() => Array.from({ length: nodeCount }, (_, index) => labelFromIndex(index)), [nodeCount]);
	const edgeList = useMemo(() => listToEdges(adjList, directed), [adjList, directed]);
	const graphLayout = useMemo(
		() => buildGraphLayout(labels, adjList, directed),
		[labels, adjList, directed]
	);

	const handleNodeCount = (event) => {
		const value = Number.parseInt(event.target.value, 10);
		if (!Number.isFinite(value) || value < 2) {
			setStatus('Enter a node count of at least 2.');
			return;
		}
		setNodeCount(value);
		setAdjList(buildEmptyList(value));
		setStatus('List resized. Add edges again.');
	};

	const handleToggleDirected = () => {
		const nextDirected = !directed;
		setDirected(nextDirected);
		if (!nextDirected) {
			setAdjList((prev) => makeUndirected(prev));
			setStatus('Switched to undirected. Reverse edges added.');
		} else {
			setStatus('Switched to directed.');
		}
	};

	const handleToggleWeighted = () => {
		const nextWeighted = !weighted;
		setWeighted(nextWeighted);
		if (!nextWeighted) {
			setAdjList((prev) => normalizeWeights(prev));
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
		setAdjList((prev) => applyEdge(prev, from, to, weight, directed));
		setStatus(`Edge ${labelFromIndex(from)} -> ${labelFromIndex(to)} added.`);
	};

	const handleRemoveEdge = () => {
		const from = parseVertex(fromText, nodeCount);
		const to = parseVertex(toText, nodeCount);
		if (from === null || to === null) {
			setStatus('Enter valid vertices (e.g. A, B, 1, 2).');
			return;
		}
		setAdjList((prev) => removeEdge(prev, from, to, directed));
		setStatus(`Edge ${labelFromIndex(from)} -> ${labelFromIndex(to)} removed.`);
	};

	const handleRandomize = () => {
		const next = buildRandomList(nodeCount, directed, weighted);
		setAdjList(next);
		setStatus('Random edges generated.');
	};

	const handleClear = () => {
		setAdjList(buildEmptyList(nodeCount));
		setStatus('List cleared.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Adjacency List</div>
						<div className="array-meta">Each node stores its outgoing neighbors</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Graph
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is an Adjacency List?</h3>
						<p>Each vertex keeps a list of neighbors and optional edge weights.</p>
					</div>
					<div className="info-card">
						<h3>Best For</h3>
						<p>Sparse graphs where most nodes connect to few neighbors.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Controls</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Nodes</label>
							<input type="number" min="2" value={nodeCount} onChange={handleNodeCount} />
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
							Clear List
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
					<div className="section-title">Adjacency List</div>
					<div className="adj-list">
						{adjList.map((neighbors, index) => (
							<div className="adj-row" key={labels[index]}>
								<div className="adj-node">{labels[index]}</div>
								<div className="adj-neighbors">
									{neighbors.length === 0 ? (
										<span className="list-empty">No neighbors</span>
									) : (
										neighbors.map((edge) => (
											<span className="edge-chip" key={`${edge.to}-${edge.weight}`}>
												{labelFromIndex(edge.to)}
												{weighted ? ` (${edge.weight})` : ''}
											</span>
										))
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Graph View</div>
					<div className="graph-shell">
						<svg className="graph-canvas" viewBox="0 0 520 360" role="img" aria-label="Graph visualization">
							<defs>
								<marker
									id="arrowhead-list"
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
										markerEnd={directed ? 'url(#arrowhead-list)' : undefined}
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

function buildEmptyList(size) {
	return Array.from({ length: size }, () => []);
}

function buildAdjList(size, edges, directed) {
	const list = buildEmptyList(size);
	edges.forEach(({ from, to, weight }) => {
		list[from].push({ to, weight });
		if (!directed) {
			list[to].push({ to: from, weight });
		}
	});
	return list;
}

function applyEdge(list, from, to, weight, directed) {
	const next = list.map((edges) => edges.map((edge) => ({ ...edge })));
	upsertEdge(next[from], to, weight);
	if (!directed) {
		upsertEdge(next[to], from, weight);
	}
	return next;
}

function removeEdge(list, from, to, directed) {
	const next = list.map((edges) => edges.map((edge) => ({ ...edge })));
	removeEdgeFrom(next[from], to);
	if (!directed) {
		removeEdgeFrom(next[to], from);
	}
	return next;
}

function upsertEdge(edges, to, weight) {
	const index = edges.findIndex((edge) => edge.to === to);
	if (index === -1) {
		edges.push({ to, weight });
	} else {
		edges[index].weight = weight;
	}
}

function removeEdgeFrom(edges, to) {
	const index = edges.findIndex((edge) => edge.to === to);
	if (index !== -1) {
		edges.splice(index, 1);
	}
}

function makeUndirected(list) {
	const next = list.map((edges) => edges.map((edge) => ({ ...edge })));
	for (let i = 0; i < next.length; i += 1) {
		next[i].forEach((edge) => {
			upsertEdge(next[edge.to], i, edge.weight);
		});
	}
	return next;
}

function normalizeWeights(list) {
	return list.map((edges) => edges.map((edge) => ({ ...edge, weight: 1 })));
}

function buildRandomList(size, directed, weighted) {
	const list = buildEmptyList(size);
	const density = size <= 4 ? 0.4 : 0.3;
	for (let i = 0; i < size; i += 1) {
		for (let j = 0; j < size; j += 1) {
			if (i === j) continue;
			if (!directed && j < i) continue;
			if (Math.random() > density) continue;
			const weight = weighted ? 1 + Math.floor(Math.random() * 9) : 1;
			upsertEdge(list[i], j, weight);
			if (!directed) {
				upsertEdge(list[j], i, weight);
			}
		}
	}
	return list;
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

function listToEdges(list, directed) {
	const edges = [];
	for (let i = 0; i < list.length; i += 1) {
		list[i].forEach((edge) => {
			if (!directed && edge.to < i) return;
			const from = labelFromIndex(i);
			const to = labelFromIndex(edge.to);
			edges.push({
				id: `${i}-${edge.to}`,
				label: `${from} ${directed ? '->' : '<->'} ${to} (${edge.weight})`,
			});
		});
	}
	return edges;
}

function buildGraphLayout(labels, list, directed) {
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
	for (let i = 0; i < list.length; i += 1) {
		list[i].forEach((edge) => {
			if (!directed && edge.to < i) return;
			const from = nodes[i];
			const to = nodes[edge.to];
			const line = trimLine(from, to, nodeRadius, arrowPadding);
			const midX = (from.x + to.x) / 2;
			const midY = (from.y + to.y) / 2;
			const offset = directed ? 12 : 0;
			edges.push({
				id: `${labels[i]}-${labels[edge.to]}`,
				from,
				to,
				line,
				weight: edge.weight,
				label: { x: midX + offset, y: midY - offset },
			});
		});
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

export default AdjacencyList;