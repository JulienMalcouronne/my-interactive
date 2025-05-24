"use client";

import Button from "../global/button/button";

export default function ResumeActions() {
  return (
    <div className="flex justify-end gap-4 mb-6 no-print">
      <Button bgColor="green" onClick={() => window.print()}>
        Imprimer / Générer PDF
      </Button>
    </div>
  );
}
