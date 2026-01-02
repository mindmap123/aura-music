import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Player from "@/components/Player/Player";
import { redirect } from "next/navigation";
import styles from "./Dashboard.module.css";
import SignOutButton from "@/components/Auth/SignOutButton";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE") {
        redirect("/login");
    }

    const storeId = (session.user as any).id;
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { style: true },
    });

    if (!store) {
        redirect("/login");
    }

    // Fetch progress for the initial current style
    let currentPosition = 0;
    if (store.currentStyleId) {
        const progress = await prisma.storeStyleProgress.findUnique({
            where: {
                storeId_styleId: {
                    storeId: storeId,
                    styleId: store.currentStyleId,
                },
            },
        });
        currentPosition = progress?.lastPosition || 0;
    }

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <span className="gradient-text">AURA</span>
                </div>
                <div className={styles.storeInfo}>
                    <span>{store.name}</span>
                    <SignOutButton />
                </div>
            </header>
            <main>
                {/* Pass the initial position for the current style */}
                <Player store={{ ...store, currentPosition }} />
            </main>
        </div>
    );
}
