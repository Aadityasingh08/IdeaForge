import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkle } from './Logo';

type Variant = 'primary' | 'mint' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-[#1e293b] shadow-soft',
  mint: 'bg-mint-dark text-white hover:bg-[#0d6a63] shadow-[0_8px_24px_-8px_rgb(15_118_110/0.55)]',
  secondary: 'bg-white text-ink border border-line hover:border-[#cbd5e1] hover:bg-[#fbfdfe] shadow-soft',
  ghost: 'text-body hover:text-ink hover:bg-[#eef6f7]',
  danger: 'bg-white text-danger border border-[#fecaca] hover:bg-[#fef2f2]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-2xl',
};

export const buttonClass = (variant: Variant = 'secondary', size: Size = 'md', extra = '') =>
  `inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, iconRight, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Sparkle className="size-4" animated /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});

export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  icon,
  iconRight,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
}) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md';
}

/** Icon-only button — always carries an accessible label. */
export function IconButton({ label, size = 'md', className = '', children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-grid shrink-0 place-items-center rounded-[10px] text-body transition-colors hover:bg-[#eef6f7] hover:text-ink disabled:opacity-40 ${
        size === 'sm' ? 'size-8' : 'size-10'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
