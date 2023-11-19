import "./App.css"
import NewAnimalForm from "./components/NewAnimalForm"
import AnimalList from "./components/AnimalList"

function App() {
    return (
        <div>
            {/* <Nav /> */}
            <div className="container">
                <NewAnimalForm />
                <AnimalList />
            </div>
        </div>
    )
}

export default App
