import "./App.css"
import Nav from "./components/Nav"
import NewAnimalForm from "./components/NewAnimalForm"

function App() {
    return (
        <div>
            <Nav />
            {/* <button className="btn btn-primary">Primary</button> */}
            <NewAnimalForm />
        </div>
    )
}

export default App
