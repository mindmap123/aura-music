"use client";

import { useState, useEffect } from "react";
import styles from "./Scheduling.module.css";
import { Plus, Clock, Trash2, Calendar } from "lucide-react";

export default function SchedulingPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [stylesList, setStylesList] = useState<any[]>([]);
    const [storesList, setStoresList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        styleId: "",
        startTime: "09:00",
        endTime: "12:00",
        storeId: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log("[Scheduling] Fetching data...");
            const [schedRes, styleRes, storeRes] = await Promise.all([
                fetch("/api/admin/schedules"),
                fetch("/api/styles"),
                fetch("/api/admin/stores")
            ]);

            console.log("[Scheduling] Responses received:", {
                schedules: schedRes.status,
                styles: styleRes.status,
                stores: storeRes.status
            });

            if (!schedRes.ok || !styleRes.ok || !storeRes.ok) {
                const schedErr = !schedRes.ok ? await schedRes.json().catch(() => ({})) : {};
                const errorDetail = schedErr.details || schedErr.error || "Unknown Error";
                throw new Error(`API Error: Sched:${schedRes.status} (${errorDetail}), Style:${styleRes.status}, Store:${storeRes.status}`);
            }

            const schedulesData = await schedRes.json();
            const stylesData = await styleRes.json();
            const storesData = await storeRes.json();

            setSchedules(schedulesData);
            setStylesList(stylesData);
            setStoresList(storesData);
        } catch (err: any) {
            console.error("[Scheduling] Fetch error:", err);
            alert(`Erreur lors du chargement des données : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce créneau horaire ?")) return;
        try {
            const res = await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Programmation Musicale</h1>
                    <p className={styles.subtitle}>Automatisez le changement de style selon l'heure de la journée.</p>
                </div>
                <button onClick={() => setShowModal(true)} className={styles.addButton}>
                    <Plus size={20} />
                    <span>Nouveau Créneau</span>
                </button>
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <p className={styles.loading}>Chargement...</p>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <Calendar size={20} />
                            <h2>Planning Actuel</h2>
                        </div>
                        <div className={styles.scheduleList}>
                            {schedules.map((s) => (
                                <div key={s.id} className={styles.scheduleItem}>
                                    <div className={styles.timeSlot}>
                                        <Clock size={16} />
                                        <span>{s.startTime} - {s.endTime}</span>
                                    </div>
                                    <div className={styles.styleInfo}>
                                        <span className={styles.icon}>{s.style.icon}</span>
                                        <span className={styles.name}>{s.style.name}</span>
                                    </div>
                                    <div className={styles.targetInfo}>
                                        {s.store ? (
                                            <span className={styles.storeBadge}>{s.store.name}</span>
                                        ) : (
                                            <span className={styles.globalBadge}>Tous les magasins</span>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(s.id)} className={styles.deleteButton}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {schedules.length === 0 && (
                                <p className={styles.empty}>Aucune programmation définie.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Ajouter un créneau</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label>Style Musical</label>
                                <select
                                    value={formData.styleId}
                                    onChange={e => setFormData({ ...formData, styleId: e.target.value })}
                                    required
                                >
                                    <option value="">Sélectionner un style</option>
                                    {stylesList.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                </select>
                            </div>

                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Heure de début</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Heure de fin</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Cible (Magasin)</label>
                                <select
                                    value={formData.storeId}
                                    onChange={e => setFormData({ ...formData, storeId: e.target.value })}
                                >
                                    <option value="">Tous les magasins (Défaut)</option>
                                    {storesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>Annuler</button>
                                <button type="submit" className={styles.saveButton}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
