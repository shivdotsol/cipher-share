import { Download } from "lucide-react";

export default function FileListItem({
    name,
    size,
    senderEmail,
    date,
}: {
    name: string;
    size: string;
    senderEmail: string;
    date: string;
}) {
    const formatName = (name: string): string => {
        if (name.length > 20) {
            return name.slice(0, 15) + "..." + name.slice(-6);
        } else {
            return name;
        }
    };

    return (
        <div className="flex flex-col w-full justify-between items-center text-xs md:text-sm font-sans font-semibold text-gray-700 mb-3 bg-muted border rounded-md px-4 py-3 cursor-pointer active:bg-gray-200 active:scale-[98%] transition-all">
            <div className="flex justify-between w-full">
                <div className="text-gray-900 text-sm mr-5 mb-1 md:hidden">
                    {formatName(name)}
                </div>
                <div className="text-black text-base mr-5 mb-1 hidden md:block">
                    {name}
                </div>
                <div>{size}</div>
            </div>
            <div className="flex flex-wrap justify-between w-full">
                <span className="flex">
                    from: <p className="ml-1">{senderEmail}</p>
                </span>
                <span>
                    <p>{date}</p>
                </span>
            </div>
        </div>
    );
}
