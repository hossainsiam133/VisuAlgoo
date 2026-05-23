import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_NODE_COUNT = 6;
const DEFAULT_EDGES = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 3, weight: 3 },
    { from: 2, to: 1, weight: 1 },
    { from: 2, to: 3, weight: 5 },
    { from: 3, to: 4, weight: 2 },
    { from: 4, to: 5, weight: 3 },
];
const RUN_DELAY_MS = 1000;

function PrimesAlgo({ onBack }) {
    const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT);
    const [directed, setDirected] = useState(false);
    const [weighted, setWeighted] = useState(true);
    const [fromText, setFromText] = useState('A');
    const [toText, setToText] = useState('C');
    const [weightText, setWeightText] = useState('3');
    const [startText, setStartText] = useState('A');
    const [adjList, setAdjList] = useState(buildAdjList(DEFAULT_NODE_COUNT, DEFAULT_EDGES, false));
    const [mstNodes, setMstNodes] = useState([]);
    const [queue, setQueue] = useState([]);
    const [parents, setParents] = useState({});
    const [order, setOrder] = useState([]);
    const [currentEdge, setCurrentEdge] = useState(null);
    const [totalWeight, setTotalWeight] = useState(0);
    const [status, setStatus] = useState('Set a start node and press Next Step.');
    const runRef = useRef({ timer: null, running: false });
    const queueRef = useRef(queue);
    const mstRef = useRef(mstNodes);
    const parentsRef = useRef(parents);
    const orderRef = useRef(order);
    const weightRef = useRef(totalWeight);

    const labels = useMemo(() => Array.from({ length: nodeCount }, (_, index) => labelFromIndex(index)), [nodeCount]);
    const graphLayout = useMemo(
        () => buildGraphLayout(labels, adjList, directed),
        [labels, adjList, directed]
    );
    const treeEdges = useMemo(
        () => parentEdgesFromLayout(parents, graphLayout.nodes),
        [parents, graphLayout.nodes]
    );

    useEffect(() => {
        queueRef.current = queue;
        mstRef.current = mstNodes;
        parentsRef.current = parents;
        orderRef.current = order;
        weightRef.current = totalWeight;
    }, [queue, mstNodes, parents, order, totalWeight]);

    const stopRun = () => {
        if (runRef.current.timer) {
            clearTimeout(runRef.current.timer);
            runRef.current.timer = null;
        }
        runRef.current.running = false;
    };

    const resetTraversal = (startIndex) => {
        setMstNodes(startIndex !== null && startIndex !== undefined ? [startIndex] : []);
        setQueue(startIndex !== null && startIndex !== undefined ? buildEdgeQueue(startIndex, adjList) : []);
        setParents({});
        setOrder(startIndex !== null && startIndex !== undefined ? [startIndex] : []);
        setCurrentEdge(null);
        setTotalWeight(0);
    };

    const handleNodeCount = (event) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isFinite(value) || value < 2) {
            setStatus('Enter a node count of at least 2.');
            return;
        }
        setNodeCount(value);
        setAdjList(buildEmptyList(value));
        resetTraversal(null);
        setStatus('Graph resized. Add edges again.');
    };

    const handleToggleDirected = () => {
        const nextDirected = !directed;
        setDirected(nextDirected);
        if (!nextDirected) {
            setAdjList((prev) => makeUndirected(prev));
            setStatus('Switched to undirected. Reverse edges added.');
        } else {
            setStatus('Switched to directed. Prim uses undirected edges.');
        }
        resetTraversal(null);
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
        resetTraversal(null);
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
        resetTraversal(null);
        setStatus(`Edge ${labelFromIndex(from)} <-> ${labelFromIndex(to)} added.`);
    };

    const handleRemoveEdge = () => {
        const from = parseVertex(fromText, nodeCount);
        const to = parseVertex(toText, nodeCount);
        if (from === null || to === null) {
            setStatus('Enter valid vertices (e.g. A, B, 1, 2).');
            return;
        }
        setAdjList((prev) => removeEdge(prev, from, to, directed));
        resetTraversal(null);
        setStatus(`Edge ${labelFromIndex(from)} <-> ${labelFromIndex(to)} removed.`);
    };

    const handleRandomize = () => {
        setAdjList(buildRandomList(nodeCount, directed, weighted));
        resetTraversal(null);
        setStatus('Random edges generated.');
    };

    const handleClear = () => {
        setAdjList(buildEmptyList(nodeCount));
        resetTraversal(null);
        setStatus('Graph cleared.');
    };

    const initializeRun = () => {
        const start = parseVertex(startText, nodeCount);
        if (start === null) {
            setStatus('Enter a valid start node.');
            return null;
        }
        resetTraversal(start);
        setStatus(`Starting Prim at ${labelFromIndex(start)}.`);
        return start;
    };

    const handleStep = () => {
        stopRun();
        if (mstRef.current.length === 0 && queueRef.current.length === 0) {
            if (initializeRun() === null) return;
            return;
        }
        if (queueRef.current.length === 0) {
            setStatus('Prim complete.');
            return;
        }
        stepTraversal();
    };

    const handleRun = () => {
        stopRun();
        if (mstRef.current.length === 0 && queueRef.current.length === 0) {
            if (initializeRun() === null) return;
        }
        runRef.current.running = true;
        setStatus('Running Prim...');
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const runStep = () => {
        if (mstRef.current.length === 0 && queueRef.current.length === 0) {
            if (initializeRun() === null) {
                stopRun();
                return;
            }
            runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
            return;
        }
        if (queueRef.current.length === 0) {
            setStatus('Prim complete.');
            stopRun();
            return;
        }
        stepTraversal();
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const stepTraversal = () => {
        const mstSet = new Set(mstRef.current);
        let pq = [...queueRef.current].sort((a, b) => a.weight - b.weight);
        let chosen = null;
        while (pq.length) {
            const edge = pq.shift();
            if (mstSet.has(edge.to)) continue;
            if (mstSet.has(edge.from)) {
                chosen = edge;
                break;
            }
        }
        if (!chosen) {
            setQueue([]);
            setStatus('Prim complete.');
            return;
        }

        mstSet.add(chosen.to);
        const nextParents = { ...parentsRef.current, [chosen.to]: chosen.from };
        const nextOrder = orderRef.current.includes(chosen.to)
            ? orderRef.current
            : [...orderRef.current, chosen.to];
        const nextWeight = weightRef.current + chosen.weight;
        const nextQueue = pq.concat(buildEdgeQueue(chosen.to, adjList));

        setCurrentEdge(chosen);
        setMstNodes(Array.from(mstSet));
        setParents(nextParents);
        setOrder(nextOrder);
        setTotalWeight(nextWeight);
        setQueue(nextQueue.sort((a, b) => a.weight - b.weight));
        setStatus(`Added edge ${labelFromIndex(chosen.from)}-${labelFromIndex(chosen.to)}.`);
    };

    const handleReset = () => {
        stopRun();
        resetTraversal(null);
        setStatus('Traversal reset.');
    };

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">Prim's Algorithm</div>
                        <div className="array-meta">Minimum spanning tree by smallest edge</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Graph
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>How Prim Works</h3>
                        <p>Grow a tree by repeatedly taking the cheapest edge from the tree.</p>
                    </div>
                    <div className="info-card">
                        <h3>Priority Queue</h3>
                        <p>Stores candidate edges sorted by weight.</p>
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
                        <div className="control-field">
                            <label>Start</label>
                            <input
                                type="text"
                                value={startText}
                                onChange={(event) => setStartText(event.target.value)}
                                placeholder="A"
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
                            Clear Graph
                        </button>
                        <button className="array-btn" type="button" onClick={handleToggleDirected}>
                            {directed ? 'Directed' : 'Undirected'}
                        </button>
                        <button className="array-btn" type="button" onClick={handleToggleWeighted}>
                            {weighted ? 'Weighted' : 'Unweighted'}
                        </button>
                        <button className="array-btn" type="button" onClick={handleStep}>
                            Next Step
                        </button>
                        <button className="array-btn" type="button" onClick={handleRun}>
                            Run Prim
                        </button>
                        <button className="array-btn" type="button" onClick={handleReset}>
                            Reset
                        </button>
                    </div>

                    <div className="array-status">{status}</div>
                </div>

                <div className="section-block">
                    <div className="section-title">Priority Queue</div>
                    <div className="queue-list">
                        {queue.length === 0 ? (
                            <span className="list-empty">Queue is empty</span>
                        ) : (
                            queue.map((edge) => (
                                <span className="queue-chip" key={`${edge.from}-${edge.to}-${edge.weight}`}>
                                    {labelFromIndex(edge.from)}-{labelFromIndex(edge.to)}:{edge.weight}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">MST Weight</div>
                    <div className="edge-list">
                        <span className="edge-chip">Total: {totalWeight}</span>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Traversal Order</div>
                    <div className="edge-list">
                        {order.length === 0 ? (
                            <span className="list-empty">No nodes added yet.</span>
                        ) : (
                            order.map((node) => (
                                <span className="edge-chip" key={`${node}-order`}>
                                    {labelFromIndex(node)}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Graph View</div>
                    <div className="graph-shell">
                        <svg className="graph-canvas" viewBox="0 0 520 360" role="img" aria-label="Prim visualization">
                            <defs>
                                <marker
                                    id="arrowhead-prim"
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
                                        markerEnd={directed ? 'url(#arrowhead-prim)' : undefined}
                                    />
                                    {edge.weight !== null && weighted && (
                                        <text className="graph-weight" x={edge.label.x} y={edge.label.y}>
                                            {edge.weight}
                                        </text>
                                    )}
                                </g>
                            ))}

                            {treeEdges.map((edge) => (
                                <line
                                    key={edge.id}
                                    className="graph-edge-tree"
                                    x1={edge.from.x}
                                    y1={edge.from.y}
                                    x2={edge.to.x}
                                    y2={edge.to.y}
                                />
                            ))}

                            {currentEdge && (
                                <line
                                    className="graph-edge-current"
                                    x1={graphLayout.nodes[currentEdge.from].x}
                                    y1={graphLayout.nodes[currentEdge.from].y}
                                    x2={graphLayout.nodes[currentEdge.to].x}
                                    y2={graphLayout.nodes[currentEdge.to].y}
                                />
                            )}

                            {graphLayout.nodes.map((node) => {
                                const index = labels.indexOf(node.label);
                                const isInTree = mstNodes.includes(index);
                                const isStart = parseVertex(startText, nodeCount) === index;
                                const nodeClass = `graph-node${isInTree ? ' graph-node-visited' : ''}`;
                                return (
                                    <g key={node.id}>
                                        <circle className={nodeClass} cx={node.x} cy={node.y} r="18" />
                                        <text className="graph-node-label" x={node.x} y={node.y}>
                                            {node.label}
                                        </text>
                                        {isStart && (
                                            <text className="graph-node-tag" x={node.x} y={node.y + 28}>
                                                START
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="graph-legend">
                            <span className="graph-legend-item">Blue edges: graph</span>
                            <span className="graph-legend-item">Green edges: MST</span>
                            <span className="graph-legend-item">Highlight shows current edge</span>
                        </div>
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

function buildEdgeQueue(node, list) {
    return list[node].map((edge) => ({ from: node, to: edge.to, weight: edge.weight }));
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
    return Number.isFinite(value) && value > 0 ? value : value;
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

function parentEdgesFromLayout(parents, nodes) {
    return Object.entries(parents)
        .map(([child, parent]) => {
            const from = nodes[Number(parent)];
            const to = nodes[Number(child)];
            if (!from || !to) return null;
            const line = trimLine(from, to, 18, 8);
            return {
                id: `${parent}-${child}`,
                from: line.from,
                to: line.to,
            };
        })
        .filter(Boolean);
}

export default PrimesAlgo;