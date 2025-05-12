import React from "react";

import dynamic from 'next/dynamic'

const My3DScene = dynamic(
    () => import('@/components/airplane/My3dScene'),
)


export default function Airplane() {
    return (
        <div>
            <My3DScene />
        </div>
    );
}
