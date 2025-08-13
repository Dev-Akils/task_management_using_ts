import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import CalendarTaskPlanner from "./components/CalendarTaskPlanner.tsx";
import ViewTask from "./components/ViewTask.tsx";

function App() {
  return (
    <div className="App">
       
      <BrowserRouter>
      
        <Routes>
          <Route path="/" element={ <CalendarTaskPlanner />}/>
          <Route path="/viewtask" element={<ViewTask />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
