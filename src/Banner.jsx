// Banner.jsx
function Banner() {
    return (
        <section className="bg-slate-950 min-h-[85vh] flex items-center">

            <div className="max-w-7xl mx-auto px-6 w-full">

                <div className="grid lg:grid-cols-2 gap-14 items-center">

                    {/* Left Content */}
                    <div>

                        <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                            Interactive Data Structure & Algorithm Visualizer
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                            Learn Algorithms
                            <span className="text-blue-500">
                                {' '}Visually
                            </span>
                        </h1>

                        <p className="text-slate-400 text-lg mt-6 leading-8 max-w-xl">
                            Explore sorting, searching, graph traversal,
                            recursion, and more with beautiful interactive
                            visualizations built using React and Canvas API.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8">

                            <button href="home" className="bg-blue-500 hover:bg-blue-600 transition px-7 py-3 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20">
                                Explore Algorithms
                            </button>

                            <button className="border border-slate-700 hover:border-blue-500 transition px-7 py-3 rounded-xl text-slate-300 hover:text-white">
                                <a href="https://github.com/hossainsiam133/VisuAlgoo"></a>
                                View Source Code
                            </button>
                            {/* <a
                                href="https://github.com/hossainsiam133/VisuAlgoo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline border border-slate-700 hover:border-blue-500 transition px-7 py-3 rounded-xl text-slate-300 hover:text-white inline-block"
                            >
                                View Source Code
                            </a> */}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 mt-12">

                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    20+
                                </h2>

                                <p className="text-slate-400 mt-1">
                                    Algorithms
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    10+
                                </h2>

                                <p className="text-slate-400 mt-1">
                                    Visualizations
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    Real-Time
                                </h2>

                                <p className="text-slate-400 mt-1">
                                    Animation
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="relative">

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

                            {/* Fake Visualizer */}
                            <div className="flex items-end gap-3 h-72">

                                <div className="bg-blue-500 w-10 h-20 rounded-t-xl"></div>

                                <div className="bg-blue-400 w-10 h-36 rounded-t-xl"></div>

                                <div className="bg-blue-300 w-10 h-52 rounded-t-xl"></div>

                                <div className="bg-blue-500 w-10 h-28 rounded-t-xl"></div>

                                <div className="bg-green-400 w-10 h-64 rounded-t-xl animate-pulse"></div>

                                <div className="bg-blue-400 w-10 h-40 rounded-t-xl"></div>

                                <div className="bg-blue-300 w-10 h-16 rounded-t-xl"></div>

                                <div className="bg-blue-500 w-10 h-48 rounded-t-xl"></div>
                            </div>

                            {/* Bottom */}
                            <div className="flex justify-between mt-8 text-sm text-slate-400">

                                <span>Bubble Sort Visualization</span>

                                <span>O(n²)</span>
                            </div>
                        </div>

                        {/* Glow */}
                        <div className="absolute -z-10 top-10 left-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Banner;