'use client';

import { useTranslations } from 'next-intl';
import Button from '../global/button/button';

export default function ResumeActions() {
  const t = useTranslations();

  return (
    <div className="flex justify-end gap-4 mb-6 no-print">
      <Button bgColor="green" onClick={() => window.print()}>
        {t('printGeneratePdf')}
      </Button>
    </div>
  );
}
