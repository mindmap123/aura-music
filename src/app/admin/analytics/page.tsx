import prisma from "@/lib/prisma";
import styles from "./Analytics.module.css";
import { Clock, Store, Music, Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getAnalytics() {
    const stores = await prisma.store.findMany({
        include: {
            playSessions: {
                include: { style: true }
            }
        }
    });

    const statsPerStore = stores.map(store => {
        const totalSeconds = store.playSessions.reduce((acc, sess) => acc + sess.totalPlayed, 0);
        const styleStats: Record<string, number> = {};

        store.playSessions.forEach(sess => {
            const name = sess.style.name;
            styleStats[name] = (styleStats[name] || 0) + sess.totalPlayed;
        });

        const favoriteStyle = Object.entries(styleStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "Aucun";

        return {
            name: store.name,
            totalHours: (totalSeconds / 3600).toFixed(1),
            favoriteStyle,
            sessionsCount: store.playSessions.length
        };
    });

    return statsPerStore;
}

export default async function AnalyticsPage() {
    const stats = await getAnalytics();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Statistiques d'Écoute</h1>
                <p className={styles.subtitle}>Analyse de l'utilisation de la plateforme par magasin.</p>
            </header>

            <div className={styles.grid}>
                {stats.map((store) => (
                    <div key={store.name} className={styles.card}>
                        <div className={styles.storeHeader}>
                            <Store size={20} className={styles.icon} />
                            <h3>{store.name}</h3>
                        </div>

                        <div className={styles.metrics}>
                            <div className={styles.metric}>
                                <Clock size={16} />
                                <span>{store.totalHours}h écoutées</span>
                            </div>
                            <div className={styles.metric}>
                                <Trophy size={16} />
                                <span>Style favori : <strong>{store.favoriteStyle}</strong></span>
                            </div>
                            <div className={styles.metric}>
                                <Music size={16} />
                                <span>{store.sessionsCount} sessions</span>
                            </div>
                        </div>

                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar} style={{ width: `${Math.min(parseFloat(store.totalHours) * 10, 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
