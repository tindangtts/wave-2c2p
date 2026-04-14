import { ReactNode } from "react";

interface ProfileMenuSectionProps {
  heading: string;
  children: ReactNode;
}

export function ProfileMenuSection({ heading, children }: ProfileMenuSectionProps) {
  return (
    <div>
      <p
        className="text-[12px] font-normal text-[#9E9E9E] px-4 pt-4 pb-2"
        style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {heading}
      </p>
      <div>{children}</div>
    </div>
  );
}
