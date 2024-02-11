import { BreadCrumb } from "primereact/breadcrumb"
import { MenuItem } from "primereact/menuitem"
import { useMatches, useNavigate } from "react-router-dom"

const AppBreadCrumbs = () => {
    // const [crumbs, setCrumbs] = useState<MenuItem[]>([])
    let matches = useMatches()
    const navigate = useNavigate()
    let crumbs = matches
        // first get rid of any matches that don't have handle and crumb
        .filter((match) => Boolean(match.handle?.crumb))
        // now map them into an array of elements, passing the loader
        // data to each one
        .map(
            (match) =>
                ({
                    label: match.handle.crumb(match),
                    command: () => navigate(match.pathname),
                } as MenuItem)
        )

    return (
        <BreadCrumb
            className="border-0 mb-2"
            model={crumbs}
            home={{ label: "Home", command: () => navigate("/") }}
        />
        // <div>{crumbs.map((crumb) => crumb)}</div>
    )
}

export default AppBreadCrumbs
