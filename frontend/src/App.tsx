import "./App.css"
import SideMenu from "./components/layout/SideMenu"
import { Outlet, useLocation } from "react-router-dom"
import PageWrapper from "./components/layout/PageWrapper"
import AppBreadCrumbs from "./AppBreadCrumbs"
import Nav from "./components/Nav"
import { useEffect, useRef, useState } from "react"
import { Toast } from "primereact/toast"
import { toastService } from "./services/toast"

function App() {
    const toast = useRef<Toast>(null)
    toastService.setToastRef(toast)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const location = useLocation()

    // Close the mobile drawer whenever the route changes.
    useEffect(() => {
        setDrawerOpen(false)
    }, [location.pathname])

    return (
        <div className="h-screen overflow-hidden relative">
            <div className="h-full w-full flex">
                {/* Backdrop — mobile only, taps close the drawer */}
                {drawerOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setDrawerOpen(false)}
                        aria-hidden="true"
                    />
                )}
                <SideMenu
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                />
                <div className="grow overflow-auto flex flex-col min-w-0">
                    <Nav onMenuClick={() => setDrawerOpen(true)} />
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
