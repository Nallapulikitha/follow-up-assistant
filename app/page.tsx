
"use client";

import { useState, useEffect } from "react";

type FollowUp = {
  id: number;
  title: string;
  person: string;
  dueDate: string;
  completed: boolean;
};

export default function Home() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPerson, setEditPerson] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    const savedFollowUps = localStorage.getItem("nudge-follow-ups");

    if (savedFollowUps) {
      try {
        setFollowUps(JSON.parse(savedFollowUps) as FollowUp[]);
      } catch {
        console.error("Could not load saved follow-ups.");
      }
    }

    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      "nudge-follow-ups",
      JSON.stringify(followUps)
    );
  }, [followUps, isLoaded]);

  function addFollowUp(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const newFollowUp: FollowUp = {
      id: Date.now(),
      title: title.trim(),
      person: person.trim() || "Not specified",
      dueDate,
      completed: false,
    };

    setFollowUps((current) => [...current, newFollowUp]);

    setTitle("");
    setPerson("");
    setDueDate("");
  }
  
  function startEditing(item: FollowUp) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPerson(item.person === "Not specified" ? "" : item.person);
    setEditDueDate(item.dueDate);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditPerson("");
    setEditDueDate("");
  }

  function saveEdit(id: number) {
    if (!editTitle.trim() || !editDueDate) {
      alert("Please enter a title and due date.");
      return;
    }

    setFollowUps((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              title: editTitle.trim(),
              person: editPerson.trim() || "Not specified",
              dueDate: editDueDate,
            }
          : item
      )
    );

    cancelEditing();
  }
    
  function renderFollowUpCard(
    item: FollowUp,
    isCompleted = false
  ) {
    const isEditing = editingId === item.id;

    return (
      <article
        key={item.id}
        className={`rounded-xl border bg-white p-4 ${
          isCompleted ? "opacity-70" : ""
        }`}
      >
        {isEditing ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit(item.id);
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Follow-up title
              </label>
              <input
                className="w-full rounded-lg border p-3"
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Person or organization
              </label>
              <input
                className="w-full rounded-lg border p-3"
                value={editPerson}
                onChange={(event) =>
                  setEditPerson(event.target.value)
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Follow-up date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border p-3"
                value={editDueDate}
                onChange={(event) =>
                  setEditDueDate(event.target.value)
                }
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Save changes
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h4
              className={`font-semibold ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {item.title}
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              {item.person} · Due {item.dueDate}
            </p>

            {isCompleted ? (
              <p className="mt-2 text-sm font-medium text-slate-500">
                Completed
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => completeFollowUp(item.id)}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Complete
                </button>
              </div>
            )}
          </>
        )}
      </article>
    );
  }
  function getFollowUpStatus(item: FollowUp): string {
    if (item.completed) {
      return "Completed";
    }

    const now = new Date();

    // Get today's date in YYYY-MM-DD format.
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const today = `${year}-${month}-${day}`;

    if (item.dueDate < today) {
      return "Overdue";
    }

    if (item.dueDate === today) {
      return "Due today";
    }

    return "Upcoming";
  }
  function completeFollowUp(id: number) {
    setFollowUps((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, completed: true }
          : item
      )
    );
  }
    const overdueFollowUps = followUps.filter(
    (item) => getFollowUpStatus(item) === "Overdue"
  );

  const todaysFollowUps = followUps.filter(
    (item) => getFollowUpStatus(item) === "Due today"
  );

  const upcomingFollowUps = followUps.filter(
    (item) => getFollowUpStatus(item) === "Upcoming"
  );

  const completedFollowUps = followUps.filter(
    (item) => getFollowUpStatus(item) === "Completed"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">

        <header className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            YOUR PERSONAL FOLLOW-UP ASSISTANT
          </p>
          <h1 className="mt-2 text-4xl font-bold">Nudge.</h1>
          <p className="mt-2 text-slate-600">
            Keep track of what deserves your attention.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Add a follow-up
          </h2>

          <form onSubmit={addFollowUp} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium">
                What do you need to follow up on?
              </label>
              <input
                id="title"
                className="w-full rounded-lg border p-3"
                placeholder="e.g. Check internship application"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="person" className="mb-1 block text-sm font-medium">
                Person or organization
              </label>
              <input
                id="person"
                className="w-full rounded-lg border p-3"
                placeholder="e.g. ABC Technologies"
                value={person}
                onChange={(event) => setPerson(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">
                Follow-up date
              </label>
              <input
                id="dueDate"
                type="date"
                className="w-full rounded-lg border p-3"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              + Add follow-up
            </button>
          </form>
        </section>

        
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">
            Your follow-ups ({followUps.length})
          </h2>

          {followUps.length === 0 && (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center">
              <p className="font-medium">Nothing on your list yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first follow-up above.
              </p>
            </div>
          )}

          {overdueFollowUps.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-red-600">
                Overdue ({overdueFollowUps.length})
              </h3>

              <div className="space-y-3">
                {overdueFollowUps.map((item) =>
                  renderFollowUpCard(item)
                )}
              </div>
            </div>
          )}

          {todaysFollowUps.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-amber-600">
                Due Today ({todaysFollowUps.length})
              </h3>

              <div className="space-y-3">
                {todaysFollowUps.map((item) =>
                  renderFollowUpCard(item)
                )}
              </div>
            </div>
          )}

          {upcomingFollowUps.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-indigo-600">
                Upcoming ({upcomingFollowUps.length})
              </h3>

              <div className="space-y-3">
                {upcomingFollowUps.map((item) =>
                  renderFollowUpCard(item)
                )}
              </div>
            </div>
          )}

          {completedFollowUps.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-slate-500">
                Completed ({completedFollowUps.length})
              </h3>

              <div className="space-y-3">
                {completedFollowUps.map((item) =>
                  renderFollowUpCard(item)
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}