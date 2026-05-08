"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Testimonial } from "@/lib/supabase";

type TestimonialForm = {
  name: string;
  text: string;
};

const emptyForm: TestimonialForm = {
  name: "",
  text: "",
};

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTestimonials(data ?? []);
  };

  useEffect(() => {
    const setupSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        await loadTestimonials();
      }

      setLoading(false);
    };

    setupSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        loadTestimonials();
      } else {
        setTestimonials([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!form.name.trim() || !form.text.trim()) {
      setMessage("Name and testimonial text are required.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("testimonials")
        .update({
          name: form.name.trim(),
          text: form.text.trim(),
        })
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Testimonial updated.");
        setForm(emptyForm);
        setEditingId(null);
        await loadTestimonials();
      }
    } else {
      const lastOrder = testimonials.at(-1)?.sort_order ?? 0;
      const { error } = await supabase.from("testimonials").insert({
        name: form.name.trim(),
        text: form.text.trim(),
        sort_order: lastOrder + 1,
        is_active: true,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Testimonial added.");
        setForm(emptyForm);
        await loadTestimonials();
      }
    }

    setSaving(false);
  };

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      text: testimonial.text,
    });
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const deleteTestimonial = async (id: string) => {
    const confirmed = window.confirm("Delete this testimonial?");

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Testimonial deleted.");
      await loadTestimonials();

      if (editingId === id) {
        cancelEditing();
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f4f4] px-6 py-10 font-mono text-[#800000] md:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em]">Loading_Admin</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#f4f4f4] px-6 py-10 font-mono text-[#800000] md:px-10">
        <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#800000]/60">
            {"// CreatorsLab_Admin"}
          </p>
          <h1 className="mb-10 text-5xl font-black uppercase leading-none tracking-tighter">
            Manage <br /> Reviews
          </h1>

          <form onSubmit={handleLogin} className="border border-[#800000] p-6">
            <label className="mb-4 block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-[#800000] bg-transparent px-4 py-3 text-sm font-bold outline-none"
                required
              />
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#800000] bg-transparent px-4 py-3 text-sm font-bold outline-none"
                required
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#800000] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#f4f4f4] transition-colors hover:bg-black disabled:opacity-50"
            >
              {saving ? "Signing In" : "Sign In"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm font-bold uppercase text-black">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-6 py-10 font-mono text-[#800000] md:px-10">
      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-[#800000]/20 pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#800000]/60">
            {"// CreatorsLab_Admin"}
          </p>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            Review <br /> Control
          </h1>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <p className="text-xs font-bold uppercase tracking-widest text-[#800000]/60">
            Signed in as {session.user.email}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-[#800000] px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-[#800000] hover:text-[#f4f4f4]"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
        <section>
          <form onSubmit={handleSave} className="sticky top-8 border border-[#800000] p-6">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter">
              {editingId ? "Edit Card" : "Add Card"}
            </h2>

            <label className="mb-4 block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full border border-[#800000] bg-transparent px-4 py-3 text-sm font-bold outline-none"
                required
              />
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest">Review Text</span>
              <textarea
                value={form.text}
                onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
                className="min-h-44 w-full resize-y border border-[#800000] bg-transparent px-4 py-3 text-sm font-bold uppercase leading-relaxed outline-none"
                required
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#800000] px-5 py-4 text-xs font-black uppercase tracking-widest text-[#f4f4f4] transition-colors hover:bg-black disabled:opacity-50"
              >
                {saving ? "Saving" : editingId ? "Update" : "Add"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="border border-[#800000] px-5 py-4 text-xs font-black uppercase tracking-widest transition-colors hover:bg-[#800000] hover:text-[#f4f4f4]"
                >
                  Cancel
                </button>
              )}
            </div>

            {message && <p className="mt-5 text-sm font-bold uppercase text-black">{message}</p>}
          </form>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.id}
              className="flex min-h-[280px] flex-col justify-between border border-[#800000] p-6"
            >
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#800000]/60">
                  Student_Ref // {String(index + 1).padStart(2, "0")}
                </p>
                <p className="text-lg font-bold uppercase leading-tight">{testimonial.text}</p>
              </div>

              <div className="mt-10">
                <p className="mb-5 text-2xl font-black uppercase tracking-tighter">{testimonial.name}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(testimonial)}
                    className="border border-[#800000] px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-[#800000] hover:text-[#f4f4f4]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="border border-black bg-black px-4 py-3 text-xs font-black uppercase tracking-widest text-[#f4f4f4] transition-colors hover:bg-[#800000]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
