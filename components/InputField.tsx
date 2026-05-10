import { InstagramIcon } from "./InstagramIcon";
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function InputField({ error, className, ...props }: InputFieldProps) {
  return (
    <div className="relative w-full group/input">
      <div className="relative flex items-center transition-transform duration-300 group-focus-within/input:-translate-y-1">
        <InstagramIcon className="absolute left-5 w-5 h-5 text-zinc-400 group-focus-within/input:text-purple-400 transition-colors duration-300 z-10" />
        <input
          className={cn(
            "w-full bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 focus:bg-white/5",
            "transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] hover:bg-zinc-900/60",
            error && "border-red-500/50 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {/* Glow behind input on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within/input:opacity-10 blur transition duration-500 pointer-events-none -z-10" />
      </div>
      {error && (
        <p className="absolute -bottom-6 left-2 text-xs text-red-400 drop-shadow-sm font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
