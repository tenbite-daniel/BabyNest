"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateOnboarding } from "../lib/api";
import { getBabySize } from "../lib/baby-size";
import MiniCalendar from "../components/MiniCalendar";
import ProgressBadge from "../components/ProgressBadge";
import SymptomTag from "../components/SymptomTag";
import JournalCard from "../components/JournalCard";
import { getJournalEntries, deleteJournalEntry } from "../lib/api";

type Profile = {
  email: string;
  fullName?: string;
  weeksPregnant?: number;
  symptoms?: string[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [week, setWeek] = useState<number>(12);
  const [saving, setSaving] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [newSymptom, setNewSymptom] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [entries, setEntries] = useState<{ _id: string; entry: string; mood: string; date: string }[]>([]);

  // ✅ Check login + load profile
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");

    if (isLoggedIn !== "true" || !token) {
      router.push("/auth/login");
      return;
    }

    setUserEmail(email || "");

    (async () => {
      try {
        const p = await getProfile();
        setProfile(p);
        if (typeof p?.weeksPregnant === "number") setWeek(p.weeksPregnant);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [router]);

  // Load journal entries
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(data.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(),
      })));
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  // Derived
  const baby = useMemo(() => getBabySize(week), [week]);
  const trimester = useMemo(() => (week <= 13 ? 1 : week <= 27 ? 2 : 3), [week]);

  // Persist week change (debounced)
  useEffect(() => {
    if (!profile) return;
    const id = setTimeout(async () => {
      try {
        setSaving(true);
        const updated = await updateOnboarding({ weeksPregnant: week });
        setProfile(updated);
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [week, profile]);

  async function addSymptom() {
    if (!newSymptom.trim()) return;
    const symptoms = Array.from(new Set([...(profile?.symptoms ?? []), newSymptom.trim()]));
    setNewSymptom("");
    setSaving(true);
    const updated = await updateOnboarding({ symptoms });
    setProfile(updated);
    setSaving(false);
  }

  async function removeSymptom(label: string) {
    const symptoms = (profile?.symptoms ?? []).filter((s) => s !== label);
    setSaving(true);
    const updated = await updateOnboarding({ symptoms });
    setProfile(updated);
    setSaving(false);
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleEdit = (id: string, entry: string, mood: string) => {
    // Note: Edit functionality is included but requires form integration if needed
    console.log('Edit clicked for ID:', id);
  };

  return (
    <div className="min-h-screen bg-[--color-background]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top header */}
        <header className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold text-[--color-primary]">BabyNest</div>
          <div className="text-sm text-gray-600">
            {profile?.fullName ? `Hi, ${profile.fullName}` : userEmail ? `Hi, ${userEmail}` : ""}
          </div>
        </header>

        {/* Hero: Calendar + Baby size */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Calendar & Week control */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Your Pregnancy Progress</h2>
              <span className="text-xs text-gray-500">{saving ? "Saving…" : "Saved"}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <MiniCalendar
                current={calendarDate}
                onPrev={() =>
                  setCalendarDate(
                    new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
                  )
                }
                onNext={() =>
                  setCalendarDate(
                    new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
                  )
                }
              />

              <div className="flex flex-col justify-between">
                <ProgressBadge week={week} />
                <label className="mt-6 text-sm text-gray-700">
                  Adjust week (1–40)
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="w-full accent-[--color-primary]"
                  />
                </label>
                <div className="text-xs text-gray-500">
                  Trimester: <span className="font-medium">{trimester}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Baby size card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center text-center">
            <div className="text-6xl mb-2">{baby.emoji}</div>
            <h3 className="text-2xl font-bold text-[--color-primary]">
              {week}
              <span className="text-base font-semibold"> weeks</span>
            </h3>
            <p className="mt-2">Your baby is about the size of a</p>
            <p className="text-lg font-semibold">{baby.title}</p>
            <button
              className="mt-4 px-4 py-2 rounded-full bg-[--color-secondary] text-white text-sm hover:opacity-90"
              onClick={() => alert("You can link this to a detailed weekly tips page.")}
            >
              Details
            </button>
          </div>
        </section>

        {/* Chatty (placeholder) */}
        <section className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-[--color-secondary]/20">
            <h3 className="font-semibold text-lg mb-2">Chaty</h3>
            <p className="text-sm text-gray-600">
              Due dates near? Chaty’s here to guide your day. (Hook this to your chat service or
              assistant.)
            </p>
            <button className="mt-4 px-4 py-2 rounded-full bg-[--color-primary] text-white text-sm">
              Open Chat
            </button>
          </div>
        </section>

        {/* Journal Entries */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Journal Entries</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((item) => (
              <JournalCard
                key={item._id}
                id={item._id}
                entry={item.entry}
                mood={item.mood}
                date={item.date}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>

        {/* Most Noted Symptoms */}
        <section className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Most Noted Symptoms</h3>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex flex-wrap gap-2">
              {(profile?.symptoms ?? []).length === 0 && (
                <span className="text-sm text-gray-500">No symptoms noted yet.</span>
              )}
              {(profile?.symptoms ?? []).map((s) => (
                <SymptomTag key={s} label={s} onRemove={() => removeSymptom(s)} />
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <input
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="Add a symptom (e.g., Nausea)"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-secondary]/40"
              />
              <button
                onClick={addSymptom}
                className="px-4 py-2 rounded-lg bg-[--color-primary] text-white text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Space for future cards (Journal, Groups, etc.) */}
        <div className="h-10" />
      </div>
    </div>
  );
}