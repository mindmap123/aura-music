"use client";

import dynamic from "next/dynamic";

const AnalyticsContent = dynamic(() => import("./AnalyticsContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function AnalyticsPage() {
    return <AnalyticsContent />;
}
