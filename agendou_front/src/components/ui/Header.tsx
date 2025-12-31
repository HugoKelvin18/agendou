import React from "react";
import { Menu } from "lucide-react";

export default function Header({ toggleSidebar }: { toggleSidebar : () => void }) {
    return (
        <header className="h-16 bg-[#0d0d0d] border-b border-[#1f1f1f] flex items-center px-4 justify-between">
            <button className="md:hidden" onClick={toggleSidebar}>
                <Menu size={26} className="text-[#d4af37]" />
            </button>

            <h2 className="text-gray-200 text-lg font-semibold">Dashboard</h2>
        </header>
    );
}