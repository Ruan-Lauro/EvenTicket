import { StaticImageData } from "next/image";
import Image from "next/image";

type ShowEvent = {
    title: string;
    img: string | StaticImageData;
    gender: string;
    city: string;
    country: string;
    onClick: ()=>void;
}

export default function ShowEvent({
    title,
    city,
    country,
    gender,
    img,
    onClick
}: ShowEvent){
    return(
        <div className="relative  min-w-75 max-h-50 overflow-hidden group cursor-pointer rounded-md" onClick={onClick} >
            <Image src={img} alt="Image" width={200} height={200} className="w-full h-auto group-hover:scale-115 transition-all duration-200 z-10 object-cover" />
            <div className="flex flex-col items-start absolute inset-0 top-30 z-50 ml-2 text-white gap-1" >
                <p className="bg-blue w-auto rounded-full text-[12px] font-bold py-0.5 px-1" >{gender}</p>
                <p className="font-bold" >{title}</p>
                <p className="text-[12px]" >{city}, {country}</p>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/98 via-black/30 to-transparent"></div>
        </div>
    );
}