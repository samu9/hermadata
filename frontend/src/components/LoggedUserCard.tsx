import { Avatar } from "primereact/avatar"

const LoggedUserCard = () => {
    return (
        <div className="rounded-lg bg-slate-100 border border-slate-400 flex items-center justify-start gap-2 p-1">
            <Avatar size="normal" />
            <div className="text-xs">Username</div>
        </div>
    )
}

export default LoggedUserCard
