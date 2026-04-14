import { ReactNode } from "react";

interface ProfileMenuSectionProps {
  heading: string;
  children: ReactNode;
}

export function ProfileMenuSection({ heading, children }: ProfileMenuSectionProps) {
  return (
    <div>
      <p
        className="text-xs font-normal text-[#767676] px-4 pt-4 pb-2"
        style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {heading}
      </p>
      <div>{children}</div>
    </div>
  );
}
