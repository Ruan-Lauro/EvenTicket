"use client"

import Header from "./header";
import { ReactNode } from "react";
import { CartProvider } from "@/contexts/cartContext";
import { CartDrawer } from "@/components/cartDrawer/cartDraw";
import { CartFab } from "@/components/cartDrawer/cartFab";

export default function MainPage({
    page,
    children
}:{
    page:number;
    children: ReactNode;
}){

    return(
        <CartProvider>
            <main className="flex justify-center">
                <section className="relative flex flex-col max-w-400 w-full items-center" >
                    <Header value={page} />
                    {children}
                </section>
            </main>
            <CartFab />
            <CartDrawer />
        </CartProvider>
    );
}