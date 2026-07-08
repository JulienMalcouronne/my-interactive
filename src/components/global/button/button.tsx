'use client';

import styles from './button.module.css';

type ButtonProps = {
  children: React.ReactNode;
  bgColor?: keyof typeof bgVariants;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const bgVariants: Record<string, string> = {
  blue: styles.blue,
  red: styles.red,
  green: styles.green,
  default: styles.default,
};

export default function Button({ children, bgColor = 'default', onClick, ...rest }: ButtonProps) {
  return (
    <button className={`${styles.button} ${bgVariants[bgColor]}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
