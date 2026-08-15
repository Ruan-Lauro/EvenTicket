import HeroCaroseul from "@/components/home/hero";
import MainPage from "@/components/main";


export default function Home(){
    return(
        <MainPage page={0} >
            <main className="flex flex-col items-center w-full" >
                <HeroCaroseul/>
                <p>Texto a baixo</p>
            </main>
        </MainPage>
    );
}