'use client'

export default function Button({ children, handler }: { children: React.ReactNode, handler: () => void }) {
    return (
        <button onClick={handler} className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer`}>
            {children}
        </button>
    )
}