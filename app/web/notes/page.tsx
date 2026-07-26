"use client";

// NOTA: para o modo escuro funcionar, o teu tailwind.config precisa de:
//   darkMode: "class"
// (Tailwind v4 com CSS-first: @custom-variant dark (&:where(.dark, .dark *));)

import Swal from "sweetalert2";
import { alert_error, alert_success } from "@/app/services/sweet-alert.service";
import { useEffect, useMemo, useState } from "react";
import { getNotes, createNote, updateNote, removeNote } from "@/app/stores/note.store";
import {
  LogOut,
  BookMarked,
  BookOpenText,
  Type,
  Languages,
  AlignLeft,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  ArrowDownUp,
  SearchX,
  CalendarPlus,
  History,
  CalendarRange,
  SlidersHorizontal,
  Moon,
  SunMedium,
} from "lucide-react";

// Cores que se alternam nos cartões, como separadores de um ficheiro de fichas
const ACCENTS = ["bg-emerald-500", "bg-amber-500", "bg-rose-400", "bg-sky-500"];

export default function NotesPage() {
  const notesData = {
    id: 0,
    word: "",
    mean: "",
    description: "",
  };
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<any>({});
  const [validations, setValidations] = useState([{message: null}]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<any>({});

  const [form, setForm] = useState(notesData);

  // Painel de filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "az">("az");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  

  // Painel de adicionar/editar, estilo "bottom sheet" de app móvel
  const [sheetOpen, setSheetOpen] = useState(false);

  // Modo escuro
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = stored ? stored === "dark" : prefersDark;
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  async function loadNotes() {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      alert_error();
    } finally {
      setLoading(false);
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      if (form.id) {
        await updateNote(form);
      } else {
        await createNote(form);
      }

      alert_success();
      setForm(notesData);
      setSheetOpen(false);
    } catch (error: any) {

      if (error?.response?.status  == 422) {
        setValidations(error?.response?.data?.errors);
        return;
      }
      
      alert_error();
    } finally {
      setSaving(false);
      await loadNotes();
    }
  }

  async function remove(id: number) {
    try {
      await removeNote(id);
      alert_success();
      setForm(notesData);
    } catch (error: any) {
      alert_error();
    } finally {
      setDeleting({ [id]: false });
      await loadNotes();
    }
  }

  async function confirmRemove(id: number) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        remove(id);
      }
    });
  }

  function openAdd() {
    setForm(notesData);
    setSheetOpen(true);
  }

  function setEdit(note: any) {
    setForm({
      id: note.id ?? "",
      word: note.word ?? "",
      mean: note.mean ?? "",
      description: note.description ?? "",
    });
    setSheetOpen(true);
  }

  function cancelEdit() {
    setForm(notesData);
    setSheetOpen(false);
  }

  // Função para fechar ou sair da PWA
  function handleExitApp() {
    Swal.fire({
      title: "Sair da aplicação?",
      text: "Tens a certeza que desejas fechar a app?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f43f5e",
    }).then((result) => {
      if (result.isConfirmed) {
        // Tenta fechar a janela
        window.close();

        // Se o navegador bloquear o window.close(), redireciona para uma página neutra ou home
        setTimeout(() => {
          if (!window.closed) {
            window.location.href = "about:blank";
          }
        }, 300);
      }
    });
  }

  useEffect(() => {
    loadNotes();
  }, []);

  // Trava o scroll de fundo enquanto o painel estiver aberto, como um modal nativo
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const isEditing = Boolean(form.id);

  function getDate(note: any) {
    const value = note?.created_at ?? note?.createdAt ?? note?.date;
    return value ? new Date(value).getTime() : 0;
  }

  function getUpdatedDate(note: any) {
    const value = note?.updated_at ?? note?.updatedAt;
    return value ? new Date(value).getTime() : 0;
  }

  function formatDate(value: any) {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = !term
      ? [...notes]
      : notes.filter((note: any) =>
          [note.word, note.mean, note.description]
            .filter(Boolean)
            .some((field: string) => field.toLowerCase().includes(term))
        );

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((note: any) => getDate(note) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      result = result.filter((note: any) => getDate(note) <= to);
    }

    if (sortBy === "az") {
      result.sort((a: any, b: any) => (a.word ?? "").localeCompare(b.word ?? ""));
    } else if (sortBy === "recent") {
      result.sort((a: any, b: any) => getDate(b) - getDate(a));
    } else if (sortBy === "oldest") {
      result.sort((a: any, b: any) => getDate(a) - getDate(b));
    }

    return result;
  }, [notes, search, sortBy, dateFrom, dateTo]);

  const hasActiveFilters = Boolean(search || dateFrom || dateTo);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-50 pb-28 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Barra de app fixa no topo */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-600/30 dark:from-emerald-400 dark:to-emerald-600">
            <BookOpenText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Meu Anotador
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {search
                ? `${filteredNotes.length} de ${notes.length} palavras`
                : `${notes.length} ${notes.length === 1 ? "palavra" : "palavras"}`}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            style={{ cursor: "pointer" }}
            aria-label="Alternar modo escuro"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <Moon
                className={`absolute h-4 w-4 transition-all duration-300 ${
                  darkMode ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                }`}
              />
              <SunMedium
                className={`absolute h-4 w-4 transition-all duration-300 ${
                  darkMode ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            style={{ cursor: "pointer" }}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              filtersOpen || hasActiveFilters
                ? "bg-emerald-600 text-white dark:bg-emerald-500"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && !filtersOpen && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>

        {/* Painel de filtros, colapsável */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            filtersOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-5xl space-y-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por palavra, significado ou descrição..."
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-9 text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ cursor: "pointer" }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "oldest" | "az")}
                  style={{ cursor: "pointer" }}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-6 text-xs font-medium text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="az">A - Z</option>
                  <option value="recent">Mais recentes</option>
                  <option value="oldest">Mais antigas</option>
                </select>
              </div>

              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <CalendarRange className="h-3.5 w-3.5" />
              </span>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                style={{ cursor: "pointer" }}
                className="rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-xs text-slate-400 dark:text-slate-500">a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                style={{ cursor: "pointer" }}
                className="rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  style={{ cursor: "pointer" }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X className="h-3 w-3" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-5">
        {/* Carregamento */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-500 dark:text-emerald-400" />
            <p className="text-sm font-medium">A carregar as tuas palavras...</p>
          </div>
        )}

        {/* Vazio */}
        {!loading && notes.length === 0 && (
          <div className="animate-fade-slide-up flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center transition-colors dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400">
              <BookMarked className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Ainda não tens palavras guardadas
            </p>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Toca no botão + para adicionares a tua primeira palavra.
            </p>
          </div>
        )}

        {/* Sem resultados para o filtro */}
        {!loading && notes.length > 0 && filteredNotes.length === 0 && (
          <div className="animate-fade-slide-up flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-700/50 dark:text-slate-400">
              <SearchX className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Nenhuma palavra corresponde ao filtro
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
              }}
              style={{ cursor: "pointer" }}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtro
            </button>
          </div>
        )}

        {/* Lista */}
        {!loading && filteredNotes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note: any, index: number) => (
              <article
                key={note.id}
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                className="animate-fade-slide-up group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 pl-6 shadow-sm transition duration-300 active:scale-[0.99] sm:hover:-translate-y-1 sm:hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-white/5 dark:sm:hover:shadow-emerald-500/5"
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1.5 ${ACCENTS[index % ACCENTS.length]}`}
                />

                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-slate-100">
                  <BookMarked className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  {note.word}
                </h2>

                <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">
                  {note.mean}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                  {note.description}
                </p>

                {(formatDate(note.created_at ?? note.createdAt) ||
                  formatDate(note.updated_at ?? note.updatedAt)) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    {formatDate(note.created_at ?? note.createdAt) && (
                      <span className="flex items-center gap-1">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Criado em {formatDate(note.created_at ?? note.createdAt)}
                      </span>
                    )}

                    {formatDate(note.updated_at ?? note.updatedAt) &&
                      getUpdatedDate(note) !== getDate(note) && (
                        <span className="flex items-center gap-1">
                          <History className="h-3.5 w-3.5" />
                          Actualizado em {formatDate(note.updated_at ?? note.updatedAt)}
                        </span>
                      )}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => setEdit(note)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>

                  <button
                    type="button"
                    style={{ cursor: "pointer" }}
                    disabled={deleting[note.id]}
                    onClick={() => confirmRemove(note.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-60 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    {deleting[note.id] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {deleting[note.id] ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Botão flutuante para adicionar palavra */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Botão flutuante para fechar / sair da PWA */}
        <button
          type="button"
          onClick={handleExitApp}
          style={{ cursor: "pointer" }}
          aria-label="Sair da aplicação"
          title="Sair da aplicação"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition hover:scale-105 hover:bg-rose-600 active:scale-95 dark:bg-rose-600 dark:shadow-rose-600/20 dark:hover:bg-rose-500"
        >
          <LogOut className="h-5 w-5" />
        </button>

        {/* Botão flutuante para adicionar palavra */}
        <button
          type="button"
          onClick={openAdd}
          style={{ cursor: "pointer" }}
          aria-label="Adicionar palavra"
          className={`flex h-14 w-14 items-center justify-center rounded-full
          bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/40 transition
          hover:scale-105 hover:shadow-emerald-600/50 active:scale-95
          dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-500/30 ${
            notes.length === 0 ? "animate-soft-pulse" : ""
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Painel inferior (bottom sheet) para adicionar/editar */}
      <div
        onClick={() => !saving && cancelEdit()}
        className={`fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } dark:bg-black/60`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-t-3xl bg-white p-6 pb-8 shadow-2xl transition-transform duration-300 ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          } dark:bg-slate-800`}
        >
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-600" />

          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-slate-100">
              {isEditing ? (
                <>
                  <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Editar palavra
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Nova palavra
                </>
              )}
            </h2>
            <button
              type="button"
              onClick={cancelEdit}
              style={{ cursor: "pointer" }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Type className="h-3.5 w-3.5" />
                Palavra ou Frase
              </label>
              <input
                type="text"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                placeholder="Exemplo: Beautiful"
              />
             
             {validations && Object.keys(validations).length != 0 && (
                <span className="mt-1 block text-xs font-medium text-rose-500">
                  { (validations?.filter((e:any)=>e.path=='word'))[0]?.message }
                </span>
              )} 
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Languages className="h-3.5 w-3.5" />
                Significado
              </label>
              <input
                type="text"
                value={form.mean}
                onChange={(e) => setForm({ ...form, mean: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                placeholder="Exemplo: Bonito"
              />

              {validations &&  Object.keys(validations).length != 0 && (
                <span className="mt-1 block text-xs font-medium text-rose-500">
                  { (validations?.filter((e:any)=>e.path=='mean'))[0]?.message }
                </span>
              )} 
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <AlignLeft className="h-3.5 w-3.5" />
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                placeholder="Explique o significado da palavra"
              />

              {validations &&  Object.keys(validations).length != 0 && (
                <span className="mt-1 block text-xs font-medium text-rose-500">
                  { (validations?.filter((e:any)=>e.path=='description'))[0]?.message }
                </span>
              )} 
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                style={{ cursor: saving ? "not-allowed" : "pointer" }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium text-white shadow-md shadow-emerald-600/20 transition
                ${
                  saving
                    ? "cursor-not-allowed bg-emerald-400 dark:bg-emerald-500/50"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 dark:from-emerald-500 dark:to-emerald-400"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving ? "Guardando..." : isEditing ? "Alterar" : "Guardar"}
              </button>

              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                style={{ cursor: "pointer" }}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.45s ease-out both;
        }

        @keyframes softPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.35);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
          }
        }
        .animate-soft-pulse {
          animation: softPulse 2.4s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-slide-up,
          .animate-soft-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}