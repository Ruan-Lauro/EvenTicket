import Header from "./header";
import { ReactNode } from "react";

export default function MainPage({
    page,
    children
}:{
    page:number;
    children: ReactNode;
}){
    return(
        <main className="flex justify-center">
            <section className="relative flex flex-col max-w-400 w-full items-center" >
                <Header value={page} />
                {children}
            </section>
        </main>
    );
}