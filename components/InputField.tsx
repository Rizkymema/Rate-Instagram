import { InstagramIcon } from "./InstagramIcon";
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function InputField({ error, className, ...props }: InputFieldProps) {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <InstagramIcon className="absolute left-4 w-5 h-5 text-zinc-400 z-10" />
        <input
          className={cn(
            "w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-4 pl-12 pr-4 text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500",
            "transition-all duration-300 shadow-inner",
            error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="absolute -bottom-6 left-4 text-xs text-red-500 drop-shadow-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
