"use client"

import logo from "@/assets/ticket.png";
import logobranca from "@/assets/logobranca.png";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { RiCoupon2Line } from "react-icons/ri";
import { RiAddCircleLine } from "react-icons/ri";
import { RiCalendarCheckLine } from "react-icons/ri";
import { RiPassValidLine } from "react-icons/ri";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";

interface MenuLinkProps {
    text: string;
    icon?: ReactNode;
    linkPage: string;
    isActive: boolean;
    onClick?: () => void;
    scrolled: boolean;
}

function MenuItem({ text, icon, linkPage, isActive, onClick, scrolled }: MenuLinkProps) {
    return (
        <Link href={linkPage} onClick={onClick}>
            <li className={`flex items-center gap-1 cursor-pointer ${isActive ? "text-blue" : "hover:text-blue transition-colors"} ${scrolled?"text-text":"text-white"}`}>
                {icon}
                <p className={`${isActive ? "relative after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-1/2 after:-translate-x-1/2 after:bg-blue" : ""}`}>{text}</p>
            </li>
        </Link>
    );
}

function MobileMenuItem({ text, icon, linkPage, isActive, onClick }: MenuLinkProps) {
    return (
        <Link href={linkPage} onClick={onClick}>
            <li
                className={`
                    flex items-center gap-3 px-4 py-4 text-base font-medium rounded-sm cursor-pointer
                    transition-all duration-200
                    ${isActive
                        ? "bg-blue/10 text-blue"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue active:scale-95"
                    }
                `}
            >
                <span className="text-xl">{icon}</span>
                <span>{text}</span>
            </li>
        </Link>
    );
}

export default function Header({ value }: { value: number }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const user = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) setMobileOpen(false);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const navItems = [
        { text: "Criar evento",  icon: <RiAddCircleLine />,    linkPage: "/home/createEvents", id: 1, see: user.user?.role === "ORGANIZER" },
        { text: "Meus eventos",  icon: <RiCalendarCheckLine />, linkPage: "", id: 2, see: user.user?.role === "ORGANIZER" },
        { text: "Meus tickets",  icon: <RiCoupon2Line />,      linkPage: "", id: 3, see: user.user?.role === "USER" },
        { text: "funcionário",   icon: <RiPassValidLine />,    linkPage: "", id: 4, see: user.user?.role === "ADMIN" },
    ];

    const visibleNavItems = navItems;
    return (
        <>
            <header
                className={`
                    flex justify-between items-center py-3 px-5 w-full fixed top-0 z-70
                    transition-shadow duration-300 max-w-400
                    ${scrolled? "shadow-md bg-white" : "shadow-none "}
                    ${value === 0?"bg-black/1 backdrop-blur-md":""}
                `}
            >
                <Link  href={"/home"} >
                    {scrolled?(
                        <Image
                            src={logo}
                            width={350}
                            height={200}
                            alt="logo"
                            className="w-33 h-auto cursor-pointer transition-all hover:scale-105 duration-100"
                            loading="eager"
                        />
                    ):(
                        <Image
                            src={logobranca}
                            width={350}
                            height={200}
                            alt="logo"
                            className="w-33 h-auto cursor-pointer transition-all hover:scale-105 duration-100"
                            loading="eager"
                        />
                    )}
                </Link>

                <nav className="hidden md:flex items-center gap-5">
                    <ul className="flex gap-5 text-text">
                        {visibleNavItems.map((item) => (
                            <MenuItem
                                key={item.id}
                                text={item.text}
                                icon={item.icon}
                                linkPage={item.linkPage}
                                isActive={value === item.id}
                                scrolled={scrolled}
                            />
                        ))}
                    </ul>
                    <div className={`flex items-center gap-1 border p-1.5 rounded-full cursor-pointer  transition-colors ${scrolled?"border-blue text-blue hover:text-black  hover:border-black/50":"border-white text-white hover:border-blue hover:text-blue"}`}>
                        <IoPersonSharp className="text-2xl" />
                    </div>
                </nav>

                <button
                    className="md:hidden flex items-center justify-center border border-blue text-blue p-2 rounded-full
                               hover:border-black/50 hover:text-black transition-colors"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                >
                    <span className="text-2xl transition-transform duration-300">
                        <div className="flex items-center">
                            <RiMenuLine className="text-xl" />
                            <IoPersonSharp />
                        </div>
                    </span>
                </button>
            </header>

            <div
                className={`
                    fixed inset-0 z-40 bg-black/30 backdrop-blur-sm
                    transition-opacity duration-300 md:hidden
                    ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                onClick={() => setMobileOpen(false)}
            />

            <aside
                className={`
                    fixed top-0 right-0 z-90 h-full w-72 bg-white shadow-2xl
                    flex flex-col
                    transition-transform duration-300 ease-in-out md:hidden
                    ${mobileOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm tracking-wide">Menu</span>
                    <button
                        className="text-gray-500 hover:text-blue transition-colors p-1 rounded-lg hover:bg-gray-100"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Fechar menu"
                    >
                        <RiCloseLine className="text-xl" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="flex flex-col gap-1">
                        {visibleNavItems.map((item) => (
                            <div key={item.id}>
                                <MobileMenuItem
                                    text={item.text}
                                    icon={item.icon}
                                    linkPage={item.linkPage}
                                    isActive={value === item.id}
                                    onClick={() => setMobileOpen(false)}
                                    scrolled={scrolled}
                                />
                            </div>
                        ))}
                    </ul>
                </nav>

                <div className="px-5 py-5">
                    <button className="w-full flex items-center gap-3 p-3 rounded-sm border border-blue text-blue hover:bg-blue/5 transition-colors">
                        <IoPersonSharp className="text-xl" />
                        <span className="font-medium text-sm">Minha conta</span>
                    </button>
                </div>
            </aside>
        </>
    );
}