"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
    const pathname = usePathname();

    const paths = pathname.split("/").filter(Boolean);

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-500">

            {paths.map((path, index) => {
                const href = "/" + paths.slice(0, index + 1).join("/");

                const name = path
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase());

                return (
                    <div key={href} className="flex items-center gap-2">
                        <span>/</span>

                        <Link
                            href={href}
                            className="hover:text-blue"
                        >
                            {name}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}