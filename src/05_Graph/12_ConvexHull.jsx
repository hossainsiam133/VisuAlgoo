import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_POINT_COUNT = 10;
const RUN_DELAY_MS = 700;
const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 360;
const CANVAS_PADDING = 26;

function ConvexHull({ onBack }) {
    const [pointCount, setPointCount] = useState(DEFAULT_POINT_COUNT);
    const [xText, setXText] = useState('50');
    const [yText, setYText] = useState('50');
    const [points, setPoints] = useState(buildRandomPoints(DEFAULT_POINT_COUNT));
    const [hull, setHull] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [currentEdge, setCurrentEdge] = useState(null);
    const [status, setStatus] = useState('Generate points, then step to build the hull.');
    const runRef = useRef({ timer: null, running: false });
    const hullRef = useRef(hull);
    const stepRef = useRef(stepIndex);

    useEffect(() => {
        hullRef.current = hull;
        stepRef.current = stepIndex;
    }, [hull, stepIndex]);

    useEffect(() => () => stopRun(), []);

    const hullEdges = useMemo(() => buildHullEdges(hull), [hull]);
    const edgesToShow = useMemo(() => hullEdges.slice(0, stepIndex), [hullEdges, stepIndex]);

    const stopRun = () => {
        if (runRef.current.timer) {
            clearTimeout(runRef.current.timer);
            runRef.current.timer = null;
        }
        runRef.current.running = false;
    };

    const resetTraversal = () => {
        setHull([]);
        setStepIndex(0);
        setCurrentEdge(null);
    };

    const handlePointCount = (event) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isFinite(value) || value < 3) {
            setStatus('Enter a point count of at least 3.');
            return;
        }
        setPointCount(value);
        setPoints(buildRandomPoints(value));
        resetTraversal();
        setStatus('Random points generated.');
    };

    const handleRandomize = () => {
        setPoints(buildRandomPoints(pointCount));
        resetTraversal();
        setStatus('Random points generated.');
    };

    const handleClear = () => {
        setPoints([]);
        resetTraversal();
        setStatus('All points cleared.');
    };

    const handleAddPoint = () => {
        const xPercent = parseCoordinate(xText);
        const yPercent = parseCoordinate(yText);
        if (xPercent === null || yPercent === null) {
            setStatus('Enter X and Y between 0 and 100.');
            return;
        }
        const nextPoint = mapPercentToPoint(xPercent, yPercent);
        setPoints((prev) => [...prev, nextPoint]);
        resetTraversal();
        setStatus(`Point ${labelFromIndex(points.length)} added.`);
    };

    const computeHull = () => {
        if (points.length < 3) {
            setStatus('Need at least 3 points for a hull.');
            return null;
        }
        const result = monotonicChain(points);
        if (result.length < 2) {
            setStatus('Hull could not be formed. Add more spread out points.');
            return null;
        }
        setHull(result);
        setStepIndex(0);
        setCurrentEdge(null);
        setStatus('Hull computed. Step through edges.');
        return result;
    };

    const handleComputeAll = () => {
        stopRun();
        const result = computeHull();
        if (!result) return;
        const edges = buildHullEdges(result);
        setStepIndex(edges.length);
        setCurrentEdge(null);
        setStatus('Hull complete.');
    };

    const handleStep = () => {
        stopRun();
        if (hullRef.current.length === 0) {
            if (!computeHull()) return;
        }
        stepTraversal();
    };

    const handleRun = () => {
        stopRun();
        if (hullRef.current.length === 0) {
            if (!computeHull()) return;
        }
        runRef.current.running = true;
        setStatus('Animating hull...');
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const runStep = () => {
        if (hullRef.current.length === 0) {
            if (!computeHull()) {
                stopRun();
                return;
            }
            runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
            return;
        }
        if (stepRef.current >= buildHullEdges(hullRef.current).length) {
            setStatus('Hull complete.');
            stopRun();
            return;
        }
        stepTraversal();
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const stepTraversal = () => {
        const edges = buildHullEdges(hullRef.current);
        if (stepRef.current >= edges.length) {
            setStatus('Hull complete.');
            setCurrentEdge(null);
            return;
        }
        const edge = edges[stepRef.current];
        setCurrentEdge(edge);
        setStepIndex(stepRef.current + 1);
        setStatus(`Edge ${labelFromIndex(edge.from)} -> ${labelFromIndex(edge.to)} added.`);
    };

    const handleReset = () => {
        stopRun();
        resetTraversal();
        setStatus('Traversal reset.');
    };

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">Convex Hull</div>
                        <div className="array-meta">Smallest polygon covering all points</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Graph
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>How It Works</h3>
                        <p>Sort points and keep only left turns to build the hull.</p>
                    </div>
                    <div className="info-card">
                        <h3>Visualization</h3>
                        <p>Step through edges to see the hull wrap around points.</p>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Controls</div>
                    <div className="array-controls">
                        <div className="control-field">
                            <label>Points</label>
                            <input type="number" min="3" value={pointCount} onChange={handlePointCount} />
                        </div>
                        <div className="control-field">
                            <label>X (0-100)</label>
                            <input type="number" value={xText} onChange={(event) => setXText(event.target.value)} />
                        </div>
                        <div className="control-field">
                            <label>Y (0-100)</label>
                            <input type="number" value={yText} onChange={(event) => setYText(event.target.value)} />
                        </div>
                    </div>

                    <div className="viz-controls">
                        <button className="array-btn" type="button" onClick={handleAddPoint}>
                            Add Point
                        </button>
                        <button className="array-btn" type="button" onClick={handleRandomize}>
                            Randomize
                        </button>
                        <button className="array-btn" type="button" onClick={handleClear}>
                            Clear Points
                        </button>
                        <button className="array-btn" type="button" onClick={handleComputeAll}>
                            Compute Hull
                        </button>
                        <button className="array-btn" type="button" onClick={handleStep}>
                            Next Step
                        </button>
                        <button className="array-btn" type="button" onClick={handleRun}>
                            Run Hull
                        </button>
                        <button className="array-btn" type="button" onClick={handleReset}>
                            Reset
                        </button>
                    </div>

                    <div className="array-status">{status}</div>
                </div>

                <div className="section-block">
                    <div className="section-title">Hull Order</div>
                    <div className="edge-list">
                        {hull.length === 0 ? (
                            <span className="list-empty">Hull not computed yet.</span>
                        ) : (
                            hull.map((index) => (
                                <span className="edge-chip" key={`hull-${index}`}>
                                    {labelFromIndex(index)}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Graph View</div>
                    <div className="graph-shell">
                        <svg className="graph-canvas" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} role="img" aria-label="Convex hull visualization">
                            {edgesToShow.map((edge) => (
                                <line
                                    key={`edge-${edge.from}-${edge.to}`}
                                    className="graph-edge-tree"
                                    x1={points[edge.from].x}
                                    y1={points[edge.from].y}
                                    x2={points[edge.to].x}
                                    y2={points[edge.to].y}
                                />
                            ))}

                            {currentEdge && points[currentEdge.from] && points[currentEdge.to] && (
                                <line
                                    className="graph-edge-current"
                                    x1={points[currentEdge.from].x}
                                    y1={points[currentEdge.from].y}
                                    x2={points[currentEdge.to].x}
                                    y2={points[currentEdge.to].y}
                                />
                            )}

                            {points.map((point, index) => {
                                const isHull = hull.includes(index);
                                const isCurrent = currentEdge && (currentEdge.from === index || currentEdge.to === index);
                                const nodeClass = `graph-node${isCurrent ? ' graph-node-current' : isHull ? ' graph-node-visited' : ''}`;
                                return (
                                    <g key={point.id}>
                                        <circle className={nodeClass} cx={point.x} cy={point.y} r="14" />
                                        <text className="graph-node-label" x={point.x} y={point.y}>
                                            {labelFromIndex(index)}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="graph-legend">
                            <span className="graph-legend-item">Green edges: hull</span>
                            <span className="graph-legend-item">Orange edge: current step</span>
                            <span className="graph-legend-item">Blue nodes: hull points</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function buildRandomPoints(count) {
    const points = [];
    for (let i = 0; i < count; i += 1) {
        const xPercent = 10 + Math.random() * 80;
        const yPercent = 10 + Math.random() * 80;
        points.push(mapPercentToPoint(xPercent, yPercent));
    }
    return points;
}

function mapPercentToPoint(xPercent, yPercent) {
    const x = CANVAS_PADDING + ((CANVAS_WIDTH - CANVAS_PADDING * 2) * xPercent) / 100;
    const y = CANVAS_PADDING + ((CANVAS_HEIGHT - CANVAS_PADDING * 2) * yPercent) / 100;
    return { id: `${Math.random().toString(36).slice(2, 9)}`, x, y };
}

function parseCoordinate(text) {
    const value = Number.parseFloat(text);
    if (!Number.isFinite(value)) return null;
    if (value < 0 || value > 100) return null;
    return value;
}

function buildHullEdges(hull) {
    if (hull.length < 2) return [];
    const edges = [];
    for (let i = 0; i < hull.length; i += 1) {
        const from = hull[i];
        const to = hull[(i + 1) % hull.length];
        edges.push({ from, to });
    }
    return edges;
}

function monotonicChain(points) {
    const sorted = points
        .map((point, index) => ({ ...point, index }))
        .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    if (sorted.length <= 2) return sorted.map((item) => item.index);

    const lower = [];
    for (const p of sorted) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
        const p = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper).map((item) => item.index);
}

function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
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

export default ConvexHull;