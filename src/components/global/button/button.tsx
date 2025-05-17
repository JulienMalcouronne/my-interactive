export default function Button({ children, id }: { children: React.ReactNode, id: string }) {
    return (
        <button id={id} className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer`}>
            {children}
        </button>
    )
}