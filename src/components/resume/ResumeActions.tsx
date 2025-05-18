import Script from "next/script";
import Button from "../global/button/button";

export default function ResumeActions() {
  return (
    <>
      <div className="flex justify-end gap-4 mb-6 no-print">
        <Button id="print-button" bgColor="green">
          Imprimer / Générer PDF
        </Button>
      </div>
      <Script strategy="afterInteractive">
        {`
                document.getElementById('print-button')
                  .addEventListener('click', () => window.print());
              `}
      </Script>
    </>
  );
}
