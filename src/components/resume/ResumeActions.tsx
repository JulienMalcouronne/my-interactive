'use client'

import Button from "../global/button/button"

export default function ResumeActions() {
    console.log('cc')
    return (
        <div className="flex justify-end gap-4 mb-6">
            <Button bgColor="green" handler={() => window.print()}>Imprimer / Générer PDF</Button>
        </div>
    )
}