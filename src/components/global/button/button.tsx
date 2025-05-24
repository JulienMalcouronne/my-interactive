"use client";

const bgVariants: Record<string, string> = {
  blue: "bg-blue-600 hover:bg-blue-700",
  red: "bg-red-600 hover:bg-red-700",
  green: "bg-green-600 hover:bg-green-700",
};

export default function Button({
  children,
  bgColor,
  onClick,
}: {
  children: React.ReactNode;
  bgColor: keyof typeof bgVariants;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-4 py-2 text-white rounded transition-colors cursor-pointer ${bgVariants[bgColor]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
