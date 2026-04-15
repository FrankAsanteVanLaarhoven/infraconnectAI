import React from 'react';
import Link from 'next/link';

type LogoVariant = 'hero' | 'flat' | 'animated' | 'video' | 'favicon';

export function InfraConnectLogo({ 
  variant = 'flat', 
  className = "",
  size = "md",
  href
}: { 
  variant?: LogoVariant, 
  className?: string,
  size?: "sm" | "md" | "lg" | "xl" | "hero",
  href?: string
}) {
  // Mapping sizes roughly for tailwind classes relative to purely visual height
  const sizeMap = {
    sm: "h-6 md:h-7 shrink-0",
    md: "h-10 md:h-12 shrink-0",
    lg: "h-16 md:h-20 shrink-0",
    xl: "h-24 md:h-32 shrink-0",
    hero: "h-40 md:h-56 shrink-0"
  };

  // The user requested EXACT clear mappings:
  // Dashboard & Landing Page standard text+symbol = Futuristic InfraConnect AI logo design (4).png (logo-main.png)
  // Video text overlays = Futuristic metallic logo with AI design (1).png (logo-video.png)
  // Animations/Everywhere symbol = Futuristic IC logo with glowing swoosh (1).png (logo-anim.png)
  // Favicon (handled globally) = InfraConnect AI 3D logo design (1).png
  
  let src = "/brand/logo-main.png";
  if (variant === 'video') src = "/brand/logo-video.png";
  else if (variant === 'animated') src = "/brand/logo-anim.png";
  else if (variant === 'favicon') src = "/brand/favicon-source.png";
  
  // Use specific split layouts for SOTA animated branding
  return (
    <Link href={href || "/"} className={`relative flex items-center justify-start gap-3 md:gap-4 ${sizeMap[size]} ${className}`}>
      {/* 3D Swoosh Symbol - Interactive Kinetic Spin on Pointer Hover */}
      <img 
        src="/brand/logo-anim.png" 
        alt="InfraConnect AI Symbol" 
        className="w-auto h-full object-contain cursor-pointer transition-all duration-500 hover:scale-110 hover:animate-[spin_4s_linear_infinite] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
      />
      {/* Isolated Illuminated Text */}
      <img 
        src="/brand/logo-text-only.png" 
        alt="InfraConnect AI" 
        className="w-auto h-[80%] max-w-full object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] transition-all duration-700" 
      />
    </Link>
  );
}
