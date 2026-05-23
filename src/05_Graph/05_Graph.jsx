import { useState } from 'react';
import AdjacencyMatrix from './06_AdjacencyMatrix';
import AdjacencyList from './07_AdjacencyList';
import Bfs from './08_Bfs';
import Dfs from './09_Dfs';
import DijkstraAlgo from './10_DijkstraAlgo';
import PrimesAlgo from './11_PrimesAlgo';
import ConvexHull from './12_ConvexHull';
function Placeholder({ title, onBack }) {
    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">{title}</div>
                        <div className="array-meta">Module under construction</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Linked List
                    </button>
                </div>
                <div className="info-card">
                    <h3>Coming Soon</h3>
                    <p>This visualization will be added next.</p>
                </div>
            </div>
        </div>
    );
}

function Graph() {
    const [view, setView] = useState('home');

    if (view === 'AdjacencyMatrix') {
        return <AdjacencyMatrix title="Adjacency Matrix" onBack={() => setView('home')} />;
    }

    if (view === 'AdjacencyList') {
        return <AdjacencyList title="Adjacency List" onBack={() => setView('home')} />;
    }

    if (view === 'Bfs') {
        return <Bfs title="Bfs" onBack={() => setView('home')} />;
    }
    if (view === 'Dfs') {
        return <Dfs title="Dfs" onBack={() => setView('home')} />;
    }
    if (view === 'DijkstraAlgo') {
        return <DijkstraAlgo title="Dijkstra Algorithm" onBack={() => setView('home')} />;
    }
    if (view === 'PrimesAlgo') {
        return <PrimesAlgo title="Primes Algorithm" onBack={() => setView('home')} />;
    }
    if (view === 'ConvexHull') {
        return <ConvexHull title="Convex Hull" onBack={() => setView('home')} />;
    }

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="array-header">
                    <div className="array-title">Graph</div>
                    <div className="array-meta">Interactive algorithms</div>
                </div>

                <div className="section-block">
                    <div className="section-title">Representation</div>
                    <div className="button-row">
                        <button className="array-btn" type="button" onClick={() => setView('AdjacencyMatrix')}>
                            Adjacency Matrix <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('AdjacencyList')}>
                            Adjacency List <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Traversal</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('Bfs')}>
                            Breadth First Search(BFS) <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('Dfs')}>
                            Depth First Search(DFS) <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>
                <div className="section-block">
                    <div className="section-title">Algorithms</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('DijkstraAlgo')}>
                            Dijkstra Algorithm<span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('PrimesAlgo')}>
                            Primes Algorithm<span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('ConvexHull')}>
                            Convex Hull<span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Graph;
