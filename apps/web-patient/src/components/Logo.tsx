export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-content font-bold text-sm">
        ST
      </div>
      <span className={`font-bold tracking-tight ${sizes[size]}`}>
        Salud<span className="text-primary">Tech</span>
      </span>
    </div>
  );
}
