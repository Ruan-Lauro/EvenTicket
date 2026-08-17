"use client"

import { useEffect, useRef } from "react";
import { IoPersonSharp } from "react-icons/io5";
import { RiLogoutBoxLine } from "react-icons/ri";
import { MdOutlineEmail, MdOutlineBadge } from "react-icons/md";
import { useRouter } from "next/navigation";
import { logout } from "@/services/authService";
import { User } from "@/types/user";

interface UserProfileModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement>;
    isMobile?: boolean;
}

const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    CONCIERGE: "Porteiro",
    USER: "Usuário",
    ORGANIZER: "Organizador",
};

const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    CONCIERGE: "bg-purple-100 text-purple-700",
    USER: "bg-blue-100 text-blue-700",
    ORGANIZER: "bg-green-100 text-green-700",
};

export function UserProfileModal({ user, isOpen, onClose, isMobile = false }: UserProfileModalProps) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
        } finally {
            onClose();
            router.push("/auth/login");
        }
    };

    if (!isOpen) return null;

    const initials = user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    if (!isMobile) {
        return (
            <div
                ref={modalRef}
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-sm shadow-xl z-100 overflow-hidden"
                role="dialog"
                aria-label="Perfil do usuário"
            >
                <div className="px-5 pt-5 pb-4 bg-linear-to-br from-blue/10 to-blue/5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold text-sm tracking-wide">{initials}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${roleColors[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                                {roleLabels[user.role] ?? user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                        <MdOutlineEmail className="text-lg shrink-0 text-blue/70" />
                        <span className="text-sm truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MdOutlineBadge className="text-lg shrink-0 text-blue/70" />
                        <span className="text-sm">{roleLabels[user.role] ?? user.role}</span>
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm
                                   border border-red-200 text-red-600 text-sm font-medium
                                   hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all duration-150"
                    >
                        <RiLogoutBoxLine className="text-base" />
                        Sair da conta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-5 py-5 border-t border-gray-100" role="region" aria-label="Perfil do usuário">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-blue flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-sm">{initials}</span>
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${roleColors[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {roleLabels[user.role] ?? user.role}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <MdOutlineEmail className="text-base shrink-0" />
                    <span className="text-xs truncate">{user.email}</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border border-red-200 text-red-600 text-sm font-medium
                           hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
            >
                <RiLogoutBoxLine className="text-base" />
                Sair da conta
            </button>
        </div>
    );
}