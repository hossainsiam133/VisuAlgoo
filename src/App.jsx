import Array from './01_Array/01_Array.jsx'
import Stack from './02_Stack/02_Stack.jsx'
import Queue from './03_Queue/03_Queue.jsx'
import LinkedList from './04_LinkedList/04_LinkedList.jsx'
import Graph from './05_Graph/05_Graph.jsx'
import './App.css'
import Banner from './Banner.jsx'
function App() {
  return (
    <>
      <Banner />
      <div className="topics">
        <Array />
      </div>
      <div className="topics">
        <Stack />
      </div>
      <div className="topics">
        <Queue />
      </div>
      <div className="topics">
        <LinkedList />
      </div>
      <div className="topics">
        <Graph />
      </div>
      <footer class="site-footer">
        <div class="footer-content">
          <p>&copy; 2026 Siam. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default App
