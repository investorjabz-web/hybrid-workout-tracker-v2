\
import React, { useState, useMemo } from "react";

const dayTypes = [
  "D1 – Strength Push",
  "D2 – Strength Pull",
  "D3 – Legs & Power",
  "D4 – Full Body & Rings",
  "D5 – Core & Rope",
  "Recovery / Mobility",
];

const categories = ["Strength", "Skill Hold", "Jump Rope", "Core", "Mobility", "Recovery"];

const ropeWeights = ["½ lb", "1 lb"];

const ropeProtocols = ["Primer", "Conditioning", "Finisher", "Recovery"];

const initialGoals = [
  {
    id: 1,
    goal: "Weighted Pull-up +50% BW × 5 reps",
    baseline: "",
    midPoint: "",
    endResult: "",
    achieved: false,
  },
  {
    id: 2,
    goal: "Ring Dip +40% BW × 5 reps",
    baseline: "",
    midPoint: "",
    endResult: "",
    achieved: false,
  },
  {
    id: 3,
    goal: "Front Lever 10–15s hold",
    baseline: "",
    midPoint: "",
    endResult: "",
    achieved: false,
  },
  {
    id: 4,
    goal: "L-Sit 30s hold",
    baseline: "",
    midPoint: "",
    endResult: "",
    achieved: false,
  },
];

function getTodayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function WorkoutTrackerApp() {
  const [activeTab, setActiveTab] = useState("today");

  const [sessionInfo, setSessionInfo] = useState({
    date: getTodayStr(),
    week: 1,
    dayType: dayTypes[0],
    sleep: "7",
    energy: 3,
    soreness: 2,
    notes: "",
    ready: true,
    stress: 2,
    motivation: 4,
  });

  const [entryForm, setEntryForm] = useState({
    exercise: "",
    category: "Strength",
    side: "Both",
    sets: "3",
    reps: "5",
    weight: "",
    rpe: "7",
    holdTime: "",
    tempo: "",
    ropeWeight: "½ lb",
    ropeProtocol: "Primer",
    work: "30",
    rest: "30",
    rounds: "6",
    coreFocus: "",
    mobilityBlock: "",
    painFlag: false,
    painArea: "",
    painNotes: "",
  });

  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState(initialGoals);

  const handleSessionInfoChange = (field, value) => {
    setSessionInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (field, value) => {
    setEntryForm((prev) => ({ ...prev, [field]: value }));
  };

  const addEntry = () => {
    if (!entryForm.exercise) return;

    const newEntry = {
      id: Date.now(),
      ...entryForm,
      date: sessionInfo.date,
      week: Number(sessionInfo.week) || 1,
      dayType: sessionInfo.dayType,
      energy: sessionInfo.energy,
      soreness: sessionInfo.soreness,
      ready: sessionInfo.ready,
      stress: sessionInfo.stress,
      motivation: sessionInfo.motivation,
    };

    setEntries((prev) => [newEntry, ...prev]);

    setEntryForm((prev) => ({
      ...prev,
      sets: prev.sets,
      reps: prev.reps,
      weight: "",
      rpe: prev.rpe,
      holdTime: "",
      tempo: "",
      coreFocus: "",
      mobilityBlock: "",
      painFlag: false,
      painArea: "",
      painNotes: "",
    }));
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const groupedByExercise = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      if (!e.exercise) return;
      if (!map.has(e.exercise)) map.set(e.exercise, []);
      map.get(e.exercise).push(e);
    });
    return map;
  }, [entries]);

  const weeksSummary = useMemo(() => {
    const byWeek = new Map();
    entries.forEach((e) => {
      const w = e.week || 1;
      if (!byWeek.has(w)) {
        byWeek.set(w, {
          week: w,
          dates: new Set(),
          totalSets: 0,
          totalRPE: 0,
          rpeCount: 0,
          ropeMinutes: 0,
          mobilityMinutes: 0,
        });
      }
      const obj = byWeek.get(w);
      obj.dates.add(e.date);
      const sets = Number(e.sets) || 0;
      obj.totalSets += sets;

      const rpe = Number(e.rpe) || 0;
      if (rpe > 0) {
        obj.totalRPE += rpe;
        obj.rpeCount += 1;
      }

      if (e.category === "Jump Rope") {
        const work = Number(e.work) || 0;
        const rounds = Number(e.rounds) || 0;
        const totalSec = work * rounds || 0;
        obj.ropeMinutes += totalSec / 60;
      }

      if (e.category === "Mobility" || e.category === "Recovery") {
        const mins = Number(e.mobilityBlock) || 0;
        if (mins) obj.mobilityMinutes += mins;
      }
    });

    return Array.from(byWeek.values())
      .sort((a, b) => a.week - b.week)
      .map((w) => ({
        ...w,
        daysCompleted: w.dates.size,
        avgRPE: w.rpeCount ? (w.totalRPE / w.rpeCount).toFixed(1) : "-",
        ropeMinutes: w.ropeMinutes.toFixed(1),
        mobilityMinutes: w.mobilityMinutes.toFixed(1),
      }));
  }, [entries]);

  const updateGoalField = (id, field, value) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition mr-2 mb-2 ${
        activeTab === id
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 flex justify-center px-2 py-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Hybrid Athlete Workout Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Today / Log / Cycle / Goals — built for your hybrid calisthenics system.
            </p>
          </div>
          <div className="text-xs sm:text-sm text-right text-slate-500">
            <div>{sessionInfo.date}</div>
            <div>Week {sessionInfo.week}</div>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap">
          <TabButton id="today" label="Today’s Session" />
          <TabButton id="log" label="Exercise & Skills Log" />
          <TabButton id="cycle" label="Cycle Dashboard" />
          <TabButton id="goals" label="End-Goal Tracker" />
        </div>

        {activeTab === "today" && (
          <div className="space-y-4">
            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Session Info</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.date}
                    onChange={(e) => handleSessionInfoChange("date", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Week</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.week}
                    onChange={(e) => handleSessionInfoChange("week", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2 sm:col-span-2">
                  <label className="text-slate-500">Day Type</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.dayType}
                    onChange={(e) => handleSessionInfoChange("dayType", e.target.value)}
                  >
                    {dayTypes.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Sleep (hrs)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.sleep}
                    onChange={(e) => handleSessionInfoChange("sleep", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Energy (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.energy}
                    onChange={(e) => handleSessionInfoChange("energy", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Soreness (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.soreness}
                    onChange={(e) => handleSessionInfoChange("soreness", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Ready?</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.ready ? "yes" : "no"}
                    onChange={(e) =>
                      handleSessionInfoChange("ready", e.target.value === "yes")
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Stress (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.stress}
                    onChange={(e) => handleSessionInfoChange("stress", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Motivation (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={sessionInfo.motivation}
                    onChange={(e) =>
                      handleSessionInfoChange("motivation", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">
                  Session Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs sm:text-sm"
                  rows={2}
                  value={sessionInfo.notes}
                  onChange={(e) => handleSessionInfoChange("notes", e.target.value)}
                  placeholder="Plan, focus, adjustments..."
                />
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  Add Exercise / Block
                </h2>
                <button
                  onClick={addEntry}
                  className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  + Add Row
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm mb-3">
                <div className="flex flex-col gap-1 col-span-2 sm:col-span-2">
                  <label className="text-slate-500">Exercise</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.exercise}
                    onChange={(e) => handleEntryChange("exercise", e.target.value)}
                    placeholder="Weighted pull-up, front lever, L-sit..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Category</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.category}
                    onChange={(e) => handleEntryChange("category", e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Side</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.side}
                    onChange={(e) => handleEntryChange("side", e.target.value)}
                  >
                    <option value="Both">Both</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Sets</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.sets}
                    onChange={(e) => handleEntryChange("sets", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Reps</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.reps}
                    onChange={(e) => handleEntryChange("reps", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Weight / Assist (kg / %BW)</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.weight}
                    onChange={(e) => handleEntryChange("weight", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">RPE</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.rpe}
                    onChange={(e) => handleEntryChange("rpe", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Hold Time (sec)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.holdTime}
                    onChange={(e) => handleEntryChange("holdTime", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                  <label className="text-slate-500">Tempo / Notes</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                    value={entryForm.tempo}
                    onChange={(e) => handleEntryChange("tempo", e.target.value)}
                    placeholder="3-1-X, false grip, slow ecc..."
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 mt-3">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Jump Rope Block (if applicable)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs sm:text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Rope Weight</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.ropeWeight}
                      onChange={(e) =>
                        handleEntryChange("ropeWeight", e.target.value)
                      }
                    >
                      {ropeWeights.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Protocol</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.ropeProtocol}
                      onChange={(e) =>
                        handleEntryChange("ropeProtocol", e.target.value)
                      }
                    >
                      {ropeProtocols.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Work (sec)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.work}
                      onChange={(e) => handleEntryChange("work", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Rest (sec)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.rest}
                      onChange={(e) => handleEntryChange("rest", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Rounds</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.rounds}
                      onChange={(e) => handleEntryChange("rounds", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">
                    Core & Mobility
                  </h3>
                  <div className="flex flex-col gap-1 mb-2">
                    <label className="text-slate-500">Core Focus</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.coreFocus}
                      onChange={(e) => handleEntryChange("coreFocus", e.target.value)}
                      placeholder="L-sit, dragon flag, ab wheel..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Mobility Block (mins)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.mobilityBlock}
                      onChange={(e) =>
                        handleEntryChange("mobilityBlock", e.target.value)
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">
                    Pain / Niggle Tracker
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      id="painFlag"
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={entryForm.painFlag}
                      onChange={(e) =>
                        handleEntryChange("painFlag", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="painFlag"
                      className="text-slate-600 text-xs sm:text-sm"
                    >
                      Pain / issue in this block
                    </label>
                  </div>
                  <div className="flex flex-col gap-1 mb-2">
                    <label className="text-slate-500">Pain Area</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      value={entryForm.painArea}
                      onChange={(e) => handleEntryChange("painArea", e.target.value)}
                      placeholder="Shoulder, wrist, elbow..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Pain Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-2 py-1"
                      rows={2}
                      value={entryForm.painNotes}
                      onChange={(e) => handleEntryChange("painNotes", e.target.value)}
                      placeholder="What caused it, what helps..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Today’s Rows</h2>
                <span className="text-xs text-slate-500">
                  {
                    entries.filter((e) => e.date === sessionInfo.date).length
                  }{" "}
                  rows for this date
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-[11px] sm:text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-1 pr-2">Exercise</th>
                      <th className="py-1 pr-2">Cat</th>
                      <th className="py-1 pr-2">Sets</th>
                      <th className="py-1 pr-2">Reps</th>
                      <th className="py-1 pr-2">Weight</th>
                      <th className="py-1 pr-2">RPE</th>
                      <th className="py-1 pr-2">Hold</th>
                      <th className="py-1 pr-2">Notes</th>
                      <th className="py-1 pr-2">Pain?</th>
                      <th className="py-1 pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .filter((e) => e.date === sessionInfo.date)
                      .map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-slate-100 hover:bg-slate-100/60"
                        >
                          <td className="py-1 pr-2 whitespace-nowrap">
                            <div className="font-medium text-[11px] sm:text-xs text-slate-800">
                              {e.exercise}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {e.dayType}
                            </div>
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-600">
                            {e.category}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.sets}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.reps}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700 whitespace-nowrap">
                            {e.weight}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.rpe}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.holdTime}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-600 max-w-[120px] truncate">
                            {e.tempo}
                          </td>
                          <td className="py-1 pr-2 text-[11px]">
                            {e.painFlag ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                                Pain
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-1 pr-2">
                            <button
                              onClick={() => deleteEntry(e.id)}
                              className="text-[11px] text-rose-600 hover:text-rose-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {entries.filter((e) => e.date === sessionInfo.date).length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="py-4 text-center text-xs text-slate-400"
                        >
                          No rows yet. Add your first block above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === "log" && (
          <div className="space-y-4">
            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Exercise & Skills Log
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                This is your history across days and weeks. Scroll and scan for key
                movements like weighted pull-ups, dips, levers, L-sits, and rope
                work.
              </p>
              <div className="overflow-x-auto max-h-[420px]">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-[11px] sm:text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-1 pr-2">Date</th>
                      <th className="py-1 pr-2">Week</th>
                      <th className="py-1 pr-2">Exercise</th>
                      <th className="py-1 pr-2">Cat</th>
                      <th className="py-1 pr-2">Sets×Reps</th>
                      <th className="py-1 pr-2">Weight / Hold</th>
                      <th className="py-1 pr-2">RPE</th>
                      <th className="py-1 pr-2">Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length > 0 ? (
                      entries.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-slate-100 hover:bg-slate-100/60"
                        >
                          <td className="py-1 pr-2 text-[11px] text-slate-700 whitespace-nowrap">
                            {e.date}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.week}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-800 whitespace-nowrap">
                            {e.exercise}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-600">
                            {e.category}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.sets}×{e.reps}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700 whitespace-nowrap">
                            {e.weight || "-"} {e.holdTime ? `(${e.holdTime}s)` : ""}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {e.rpe}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-500 max-w-[120px] truncate">
                            {e.dayType}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 text-center text-xs text-slate-400"
                        >
                          No entries yet. Log some work on the Today tab first.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                Quick Summary by Exercise
              </h3>
              {groupedByExercise.size === 0 ? (
                <p className="text-xs text-slate-400">
                  Once you log a few sessions, you’ll see a snapshot per exercise
                  here.
                </p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {Array.from(groupedByExercise.entries()).map(([name, list]) => {
                    const latest = list[0];
                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Last: {latest.date} • {latest.sets}×{latest.reps} @{" "}
                            {latest.weight || "bodyweight"}{" "}
                            {latest.holdTime ? `(${latest.holdTime}s)` : ""}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <div>Week {latest.week}</div>
                          <div>RPE {latest.rpe}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "cycle" && (
          <div className="space-y-4">
            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                6-Week Cycle Dashboard
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Each row is a week in the block. You’ll see days completed, total
                sets, average RPE, and rough conditioning / mobility minutes.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-[11px] sm:text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-1 pr-2">Week</th>
                      <th className="py-1 pr-2">Days Completed</th>
                      <th className="py-1 pr-2">Total Sets</th>
                      <th className="py-1 pr-2">Avg RPE</th>
                      <th className="py-1 pr-2">Rope (min)</th>
                      <th className="py-1 pr-2">Mobility (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeksSummary.length > 0 ? (
                      weeksSummary.map((w) => (
                        <tr
                          key={w.week}
                          className="border-b border-slate-100 hover:bg-slate-100/60"
                        >
                          <td className="py-1 pr-2 text-[11px] text-slate-800">
                            Week {w.week}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {w.daysCompleted}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {w.totalSets}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {w.avgRPE}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {w.ropeMinutes}
                          </td>
                          <td className="py-1 pr-2 text-[11px] text-slate-700">
                            {w.mobilityMinutes}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-xs text-slate-400"
                        >
                          Log some sessions on the Today tab to populate this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                Weekly Highlight
              </h3>
              <p className="text-xs text-slate-500">
                Use the notes on your phone (or a separate field if you extend this)
                to capture one key win and one fix for each week. This keeps the
                system tight without overcomplicating the tracker UI.
              </p>
            </section>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="space-y-4">
            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                End-Goal Tracker (Per 6-Week Cycle)
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Set baselines at Week 1, check mid-block around Week 3–4, and
                fill the end result at Week 6. Tick the box when you nail it.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-[11px] sm:text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-1 pr-2">Goal</th>
                      <th className="py-1 pr-2">Baseline</th>
                      <th className="py-1 pr-2">Mid-Point</th>
                      <th className="py-1 pr-2">End Result</th>
                      <th className="py-1 pr-2">Done?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.map((g) => (
                      <tr
                        key={g.id}
                        className="border-b border-slate-100 hover:bg-slate-100/60"
                      >
                        <td className="py-1 pr-2 text-[11px] text-slate-800 max-w-[200px]">
                          {g.goal}
                        </td>
                        <td className="py-1 pr-2 text-[11px] text-slate-700">
                          <input
                            type="text"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            value={g.baseline}
                            onChange={(e) =>
                              updateGoalField(g.id, "baseline", e.target.value)
                            }
                            placeholder="e.g. +20% BW × 3"
                          />
                        </td>
                        <td className="py-1 pr-2 text-[11px] text-slate-700">
                          <input
                            type="text"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            value={g.midPoint}
                            onChange={(e) =>
                              updateGoalField(g.id, "midPoint", e.target.value)
                            }
                            placeholder="e.g. +30% BW × 4"
                          />
                        </td>
                        <td className="py-1 pr-2 text-[11px] text-slate-700">
                          <input
                            type="text"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            value={g.endResult}
                            onChange={(e) =>
                              updateGoalField(g.id, "endResult", e.target.value)
                            }
                            placeholder="e.g. +50% BW × 5"
                          />
                        </td>
                        <td className="py-1 pr-2 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={g.achieved}
                            onChange={(e) =>
                              updateGoalField(g.id, "achieved", e.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                Notes for Next Cycle
              </h3>
              <p className="text-xs text-slate-500">
                At the end of the 6-week block, copy this tracker (or export it)
                and add a short note: what worked, what didn’t, and which exercises
                you want to bias next. That’s how you build a long-term hybrid
                athlete log without bloating the UI.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return <WorkoutTrackerApp />;
}
