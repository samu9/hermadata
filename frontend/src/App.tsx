import "./App.css"
import SideMenu from "./components/layout/SideMenu"
import { Outlet } from "react-router-dom"
import PageWrapper from "./components/layout/PageWrapper"
import AppBreadCrumbs from "./AppBreadCrumbs"
import { useRef } from "react"
import { Toast } from "primereact/toast"
import { apiService } from "./main"

function App() {
    const toast = useRef<Toast>(null)
    apiService.setToastRef(toast)
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
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default App
