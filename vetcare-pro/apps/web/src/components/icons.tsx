import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function Icon({ name, size = 20, className, ...props }: IconProps & { name: string }) {
  const s = base(size);
  const icons: Record<string, JSX.Element> = {
    logo: (
      <svg {...s} className={className} {...props}>
        <path d="M12 3c-2 4-6 5-6 9a6 6 0 1 0 12 0c0-4-4-5-6-9Z" />
        <path d="M9 14h6" />
      </svg>
    ),
    dashboard: (
      <svg {...s} className={className} {...props}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
    patients: (
      <svg {...s} className={className} {...props}>
        <circle cx="11" cy="8" r="3.5" />
        <path d="M5 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
        <path d="M17 8.5h4M19 6.5v4" />
      </svg>
    ),
    tutors: (
      <svg {...s} className={className} {...props}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 20c0-3.3 2.7-6 6-6" />
        <path d="M14.5 20c0-2.5 1.8-4.5 4-4.5" />
      </svg>
    ),
    calendar: (
      <svg {...s} className={className} {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
    brain: (
      <svg {...s} className={className} {...props}>
        <path d="M9 5a3 3 0 0 0-3 3v1a2 2 0 0 0 0 4v1a3 3 0 0 0 3 3" />
        <path d="M15 5a3 3 0 0 1 3 3v1a2 2 0 0 1 0 4v1a3 3 0 0 1-3 3" />
        <path d="M9 5h6M9 19h6M12 5v14" />
      </svg>
    ),
    bell: (
      <svg {...s} className={className} {...props}>
        <path d="M18 16H6l-1.5-2.5A5 5 0 0 1 8 7.5V6a4 4 0 1 1 8 0v1.5a5 5 0 0 1 3.5 6L18 16Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
    billing: (
      <svg {...s} className={className} {...props}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </svg>
    ),
    inventory: (
      <svg {...s} className={className} {...props}>
        <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
        <path d="M3 12l9 4.5L21 12" />
        <path d="M3 16.5l9 4.5 9-4.5" />
      </svg>
    ),
    money: (
      <svg {...s} className={className} {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />
      </svg>
    ),
    clock: (
      <svg {...s} className={className} {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
    menu: (
      <svg {...s} className={className} {...props}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    ),
    logout: (
      <svg {...s} className={className} {...props}>
        <path d="M9 6v12M5 10l4-4 4 4" />
        <path d="M13 6h6v12h-6" />
      </svg>
    ),
    close: (
      <svg {...s} className={className} {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    ),
    chat: (
      <svg {...s} className={className} {...props}>
        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z" />
      </svg>
    ),
    send: (
      <svg {...s} className={className} {...props}>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    ),
    sparkles: (
      <svg {...s} className={className} {...props}>
        <path d="M12 3l1.2 4.2L17 8l-3.8 1.2L12 14l-1.2-4.8L7 8l3.8-0.8L12 3Z" />
        <path d="M5 16l.6 2.1L8 19l-2.4.8L5 22l-.6-2.2L2 19l2.4-.9L5 16Z" />
      </svg>
    ),
    search: (
      <svg {...s} className={className} {...props}>
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" />
      </svg>
    ),
    chevron: (
      <svg {...s} className={className} {...props}>
        <path d="M9 6l6 6-6 6" />
      </svg>
    ),
    activity: (
      <svg {...s} className={className} {...props}>
        <path d="M4 14l4-4 3 6 3-10 6 12" />
      </svg>
    ),
  };

  return icons[name] ?? icons.dashboard;
}
