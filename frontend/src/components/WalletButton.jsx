import { Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletButton({ onClick }) {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={onClick}
        className="rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl hover:scale-105 transition"
        size="lg"
      >
        <Wallet2 className="mr-2 h-5 w-5" />
        Wallet
      </Button>
    </div>
  );
}
