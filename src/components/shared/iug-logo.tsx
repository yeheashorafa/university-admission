import Image from "next/image";
import { cn } from "@/lib/utils";

type IugLogoProps = {
  className?: string;
  showText?: boolean;
};

export function IugLogo({ className, showText = true }: IugLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/images/iug-logo.png"
        alt="Islamic University of Gaza"
        width={56}
        height={56}
        className="size-12 rounded-full object-contain"
        priority
      />

      {showText && (
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-primary">
            الجامعة الإسلامية بغزة
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            Islamic University of Gaza
          </p>
        </div>
      )}
    </div>
  );
}