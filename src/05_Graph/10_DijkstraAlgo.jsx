import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_NODE_COUNT = 6;
const DEFAULT_EDGES = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 3, weight: 3 },
    { from: 2, to: 1, weight: 1 },
    { from: 2, to: 3, weight: 5 },
    { from: 3, to: 4, weight: 2 },
];
const RUN_DELAY_MS = 800;

function DijkstraAlgo({ onBack }) {
    const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT);
    const [directed, setDirected] = useState(true);
    const [weighted, setWeighted] = useState(true);
    const [fromText, setFromText] = useState('A');
    const [toText, setToText] = useState('C');
    const [weightText, setWeightText] = useState('3');
    const [startText, setStartText] = useState('A');
    const [adjList, setAdjList] = useState(buildAdjList(DEFAULT_NODE_COUNT, DEFAULT_EDGES, true));
    const [queue, setQueue] = useState([]);
    const [visited, setVisited] = useState([]);
    const [distances, setDistances] = useState(buildDistanceList(DEFAULT_NODE_COUNT));
    const [parents, setParents] = useState({});
    const [order, setOrder] = useState([]);
    const [current, setCurrent] = useState(null);
    const [status, setStatus] = useState('Set a start node and press Next Step.');
    const runRef = useRef({ timer: null, running: false });
    const queueRef = useRef(queue);
    const visitedRef = useRef(visited);
    const parentsRef = useRef(parents);
    const orderRef = useRef(order);
    const distRef = useRef(distances);

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
        visitedRef.current = visited;
        parentsRef.current = parents;
        orderRef.current = order;
        distRef.current = distances;
    }, [queue, visited, parents, order, distances]);

    const stopRun = () => {
        if (runRef.current.timer) {
            clearTimeout(runRef.current.timer);
            runRef.current.timer = null;
        }
        runRef.current.running = false;
    };

    const resetTraversal = (startIndex) => {
        const nextDistances = buildDistanceList(nodeCount);
        if (startIndex !== null && startIndex !== undefined) {
            nextDistances[startIndex] = 0;
        }
        setDistances(nextDistances);
        setQueue(startIndex !== null && startIndex !== undefined ? [{ node: startIndex, dist: 0 }] : []);
        setVisited([]);
        setParents({});
        setOrder([]);
        setCurrent(null);
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
            setStatus('Switched to directed.');
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
        resetTraversal(null);
        setStatus(`Edge ${labelFromIndex(from)} -> ${labelFromIndex(to)} removed.`);
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
        setStatus(`Starting Dijkstra at ${labelFromIndex(start)}.`);
        return start;
    };

    const handleStep = () => {
        stopRun();
        if (queueRef.current.length === 0 && orderRef.current.length === 0) {
            if (initializeRun() === null) return;
            return;
        }
        if (queueRef.current.length === 0) {
            setStatus('Dijkstra complete.');
            return;
        }
        stepTraversal();
    };

    const handleRun = () => {
        stopRun();
        if (queueRef.current.length === 0 && orderRef.current.length === 0) {
            if (initializeRun() === null) return;
        }
        runRef.current.running = true;
        setStatus('Running Dijkstra...');
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const runStep = () => {
        if (queueRef.current.length === 0 && orderRef.current.length === 0) {
            if (initializeRun() === null) {
                stopRun();
                return;
            }
            runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
            return;
        }
        if (queueRef.current.length === 0) {
            setStatus('Dijkstra complete.');
            stopRun();
            return;
        }
        stepTraversal();
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const stepTraversal = () => {
        const pq = [...queueRef.current].sort((a, b) => a.dist - b.dist);
        const visitedSet = new Set(visitedRef.current);
        let currentNode = null;
        while (pq.length) {
            const candidate = pq.shift();
            if (!visitedSet.has(candidate.node)) {
                currentNode = candidate;
                break;
            }
        }
        if (!currentNode) {
            setQueue([]);
            setStatus('Dijkstra complete.');
            return;
        }

        visitedSet.add(currentNode.node);
        const nextParents = { ...parentsRef.current };
        const nextDistances = [...distRef.current];
        adjList[currentNode.node].forEach((edge) => {
            const candidateDist = nextDistances[currentNode.node] + edge.weight;
            if (candidateDist < nextDistances[edge.to]) {
                nextDistances[edge.to] = candidateDist;
                nextParents[edge.to] = currentNode.node;
                pq.push({ node: edge.to, dist: candidateDist });
            }
        });

        const nextOrder = orderRef.current.includes(currentNode.node)
            ? orderRef.current
            : [...orderRef.current, currentNode.node];
        setCurrent(currentNode.node);
        setVisited(Array.from(visitedSet));
        setParents(nextParents);
        setDistances(nextDistances);
        setQueue(pq.sort((a, b) => a.dist - b.dist));
        setOrder(nextOrder);
        setStatus(`Settled ${labelFromIndex(currentNode.node)}.`);
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
                        <div className="array-title">Dijkstra Algorithm</div>
                        <div className="array-meta">Shortest paths with non-negative weights</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Graph
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>How Dijkstra Works</h3>
                        <p>Always settle the node with the smallest tentative distance.</p>
                    </div>
                    <div className="info-card">
                        <h3>Priority Queue</h3>
                        <p>Tracks the next closest node to expand.</p>
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
                            Run Dijkstra
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
                            queue.map((item) => (
                                <span className="queue-chip" key={`${item.node}-${item.dist}`}>
                                    {labelFromIndex(item.node)}:{item.dist}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Distances</div>
                    <div className="distance-list">
                        {distances.map((dist, index) => (
                            <div className="distance-row" key={`dist-${labels[index]}`}>
                                <span className="distance-label">{labels[index]}</span>
                                <span
                                    className={`distance-value ${dist === Infinity ? 'distance-infinite' : ''}`}
                                >
                                    {dist === Infinity ? 'INF' : dist}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Traversal Order</div>
                    <div className="edge-list">
                        {order.length === 0 ? (
                            <span className="list-empty">No nodes settled yet.</span>
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
                        <svg className="graph-canvas" viewBox="0 0 520 360" role="img" aria-label="Dijkstra visualization">
                            <defs>
                                <marker
                                    id="arrowhead-dijkstra"
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
                                        markerEnd={directed ? 'url(#arrowhead-dijkstra)' : undefined}
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

                            {graphLayout.nodes.map((node) => {
                                const index = labels.indexOf(node.label);
                                const isVisited = visited.includes(index);
                                const isCurrent = current === index;
                                const isStart = parseVertex(startText, nodeCount) === index;
                                const nodeClass = `graph-node${isCurrent ? ' graph-node-current' : isVisited ? ' graph-node-visited' : ''
                                    }`;
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
                            <span className="graph-legend-item">Green edges: shortest path tree</span>
                            <span className="graph-legend-item">Highlight shows settled/current</span>
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

function buildDistanceList(size) {
    return Array.from({ length: size }, () => Infinity);
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

export default DijkstraAlgo;