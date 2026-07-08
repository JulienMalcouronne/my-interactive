'use client';

import { useTranslations } from 'next-intl';
import Button from '../global/button/button';
import styles from './ResumeActions.module.css';

export default function ResumeActions() {
  const t = useTranslations();

  return (
    <div className={`${styles.actions} no-print`}>
      <Button bgColor="green" onClick={() => window.print()}>
        {t('printGeneratePdf')}
      </Button>
    </div>
  );
}
