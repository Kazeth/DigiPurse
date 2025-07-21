import { useTransfer } from "@/lib/TransferProgressContext";

export default function TransferProgress() {
  const { transfers } = useTransfer();

  if (transfers.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white p-4 rounded-lg shadow-lg z-50">
      {transfers.map(({ fileName, progress, mode }) => (
        <div key={fileName} className="mb-3">
          <p className="text-sm font-medium text-[#4C1D95]">{mode} {fileName}</p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-right text-[#4C1D95]">{progress}%</p>
        </div>
      ))}
    </div>
  );
}
