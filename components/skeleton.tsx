export default function Skeleton(){
    return(
         <div className="rounded-sm overflow-hidden animate-pulse">
            <div className="relative flex items-end h-48 bg-blue-100 min-w-75 max-h-50">
            <div className="p-4 w-full space-y-2">
                <div className="h-4 bg-white rounded w-2/9" />
                <div className="h-4 bg-white rounded w-3/4" />
                <div className="h-3 bg-white rounded w-1/2" />
            </div>
            </div>
        </div>
    );
}