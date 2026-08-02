import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  const gradId = "ig-gradient";
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="35%" stopColor="#F44336" />
          <stop offset="65%" stopColor="#E91E63" />
          <stop offset="100%" stopColor="#9C27B0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${gradId})`} />
      <rect
        x="13"
        y="13"
        width="22"
        height="22"
        rx="7"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
      />
      <circle cx="24" cy="24" r="6" fill="none" stroke="#fff" strokeWidth="2.4" />
      <circle cx="31.5" cy="16.5" r="1.6" fill="#fff" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <circle cx="24" cy="24" r="23" fill="#1877F2" />
      <path
        d="M27.5 24.5H31L31.6 20.2H27.5V17.6C27.5 16.3 27.9 15.4 29.8 15.4H31.7V11.6C31.4 11.5 30.2 11.4 28.9 11.4C26 11.4 24 13.2 24 16.4V20.2H20.7V24.5H24V37H27.5V24.5Z"
        fill="#fff"
      />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <circle cx="24" cy="24" r="23" fill="#25D366" />
      <path
        d="M24.05 12c-6.6 0-12 5.4-12 12 0 2.1.55 4.15 1.6 5.95L12 36l6.25-1.6a12 12 0 0 0 5.8 1.5h.01c6.6 0 12-5.4 12-12s-5.4-11.9-12.01-11.9Zm0 21.8h-.01a9.9 9.9 0 0 1-5.05-1.4l-.36-.22-3.7.95 1-3.6-.24-.37a9.8 9.8 0 0 1-1.5-5.21c0-5.43 4.42-9.85 9.87-9.85 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.89 6.96c0 5.43-4.43 9.84-9.88 9.84Zm5.4-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"
        fill="#fff"
      />
    </svg>
  );
}
