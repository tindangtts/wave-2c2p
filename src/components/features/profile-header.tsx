"use client";

interface ProfileHeaderProps {
  name: string;
  title?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileHeader({ name, title = "Profile Setting" }: ProfileHeaderProps) {
  const initials = getInitials(name || "");

  return (
    <div className="bg-[#FFE600] pb-8 px-4">
      {/* Status bar space */}
      <div className="h-11 safe-top" />
      {/* Title */}
      <h1 className="text-xl font-bold text-[#0091EA] text-center pt-2">
        {title}
      </h1>
      {/* Avatar */}
      <div className="flex flex-col items-center mt-4">
        <div
          className="w-[72px] h-[72px] rounded-full bg-[#FFE600] border-2 border-[#212121] flex items-center justify-center"
          aria-label={`Avatar for ${name}`}
        >
          <span className="text-2xl font-bold text-foreground leading-none">
            {initials}
          </span>
        </div>
        <p className="mt-2 text-base font-bold text-foreground">{name}</p>
      </div>
    </div>
  );
}
