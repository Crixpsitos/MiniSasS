import { NavLink } from "react-router";


const Sidebar = () => {
    const navLinkClass = ({isActive}: {isActive: boolean}) => {
        const baseClasses = "block py-2 px-4 rounded hover:bg-gray-700";
        return isActive ? `${baseClasses} bg-gray-700` : baseClasses;
    };

    const links = [
        { to: "/", label: "Dashboard" },
        { to: "/upload-videos", label: "Subir videos" },
        { to: "/settings", label: "Settings" },
    ];
    return (
        <div className="h-full w-full bg-gray-800 text-white p-4">
            <h2 className="text-2xl font-bold mb-6">Mini SAS</h2>
            <nav>
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={navLinkClass}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar