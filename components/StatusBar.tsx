import { TailSpin } from "react-loader-spinner";
import { Progress } from "./ui/progress";

function StatusBar({
    statusBarText,
    downloadProgress,
}: {
    statusBarText: string;
    downloadProgress: number;
}) {
    return (
        <div>
            <div className="flex justify-between w-full border py-2 px-4 rounded-lg font-bold text-sm mb-2">
                <div>{statusBarText}</div>
                <div>
                    <TailSpin
                        color="#000000"
                        height={20}
                        width={20}
                        strokeWidth={5}
                    />
                </div>
            </div>
            <Progress value={downloadProgress} />
        </div>
    );
}

export default StatusBar;
