import "./App.css"
import SideMenu from "./components/layout/SideMenu"
import { Outlet } from "react-router-dom"
import PageWrapper from "./components/layout/PageWrapper"
import AppBreadCrumbs from "./AppBreadCrumbs"

function App() {
    return (
        <div className="h-screen relative">
            <div className="h-full w-full flex">
                <SideMenu />
                <div className="grow overflow-auto">
                    <PageWrapper>
                        <AppBreadCrumbs />

                        <Outlet />
                    </PageWrapper>
                </div>
            </div>
        </div>
    )
}

export default App
