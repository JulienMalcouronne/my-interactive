'use client';

import Button from '@/components/global/button/button';
import styles from './page.module.css';

// Client island: the real Button component is interactive, so it needs an
// onClick handler (which a Server Component can't pass to a Client Component).
export default function DsButtons() {
  const noop = () => {};
  return (
    <div className={styles.compRow}>
      <Button bgColor="green" onClick={noop}>
        green
      </Button>
      <Button bgColor="blue" onClick={noop}>
        blue
      </Button>
      <Button bgColor="red" onClick={noop}>
        red
      </Button>
      <Button bgColor="default" onClick={noop}>
        default
      </Button>
      <Button bgColor="green" onClick={noop} disabled>
        disabled
      </Button>
    </div>
  );
}
