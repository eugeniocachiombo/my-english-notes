"use client";

import Swal from "sweetalert2";
import { alert_error, alert_success } from "@/app/services/sweet-alert.service";
import { useEffect, useState } from "react";
import { getNotes, createNote, updateNote, removeNote } from "@/app/stores/note.store";

export default function NotesPage() {
  const notesData = {
    id: 0,
    word: '',
    mean: '',
    description: '',
  };
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({});
  const [validations, setValidations] = useState(notesData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState({});

  const [form, setForm] = useState(notesData);

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
      if(form.id){
        await updateNote(form);
      }else{
        await createNote(form);
      }

      alert_success();
      setForm(notesData);
    } catch (error:any) {
      setValidations(error?.response?.data);
      // console.log("Validações", validations);
      alert_error();
    } finally {
      setSaving(false);
      await loadNotes();
    }
  }

  async function remove(id:number) {
    try {
      await removeNote(id);
      alert_success();
      setForm(notesData);
    } catch (error:any) {
      alert_error();
    } finally {
      setDeleting({ [id]: false });
      await loadNotes();
    }
  }

  async function confirmRemove(id:number) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        remove(id)        
      }
    });
  }

  async function setEdit(note:any) {
    setForm({
      id: note.id ?? '',
      word: note.word ?? '',
      mean: note.mean ?? '',
      description: note.description ?? '',
    });
  }

  useEffect(() => { loadNotes(); }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Dicionário</h1>

          <p className="mt-2 text-gray-600">
            Gerencie as suas palavras em inglês.
          </p>
        </div>

        {/* Mensagem de erro */}
        { message.type && (message.type == 'success'  && message.content.length > 0
          ? <div className=" mb-6 rounded-lg bg-green-700 px-4 py-3 ">
            {message.content}
          </div> 
          : <div className=" mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {message.content}
          </div> )
        }

        {/* Formulário */}
        <div className=" mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className=" mb-5 text-xl font-semibold text-gray-800">
            Adicionar nova palavra
          </h2>

          <form onSubmit={save} className="space-y-4">
            <div>
              <label className=" mb-1 block text-sm font-medium text-gray-600">
                Palavra ou Frase
              </label>

              <input
                type="text"
                value={form.word}
                onChange={(e) =>
                  setForm({
                    ...form,
                    word: e.target.value,
                  })
                }
                className=" w-full rounded-lg border border-gray-300 px-4 py-2 
                outline-none text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Exemplo: Beautiful"
              />
            </div>

            <div>
              <label className=" mb-1 block text-sm font-medium text-gray-600">
                Significado
              </label>

              <input
                type="text"
                value={form.mean}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mean: e.target.value,
                  })
                }
                className=" w-full rounded-lg border text-black border-gray-300
                 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Exemplo: Bonito"
              />
            </div>

            <div>
              <label className=" mb-1 block text-sm font-medium text-gray-600">
                Descrição
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={3}
                className=" w-full text-black resize-none rounded-lg border 
                border-gray-300 px-4 py-2 outline-none focus:border-blue-500 
                focus:ring-2 focus:ring-blue-200"
                placeholder="Explique o significado da palavra"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ cursor: saving ? "not-allowed" : "pointer" }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 font-medium text-white transition
              ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}

              {saving ? "Guardando..." : "Guardar Palavra"}
            </button>
          </form>
        </div>

        {/* Carregamento */}
        {loading && (
          <div className="flex justify-center py-10">
            <div
              className=" h-10 w-10 animate-spin rounded-full
             border-4 border-blue-500 border-t-transparent"
            />
          </div>
        )}

        {/* Lista */}
        {!loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900">{note.word}</h2>

                <p className="mt-3 text-gray-700">{note.mean}</p>

                <p className="mt-2 text-sm text-gray-500">{note.description}</p>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    style={{cursor:'pointer'}}
                    onClick={() => setEdit(note)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    style={{cursor:'pointer'}}
                    disabled={deleting[note.id]}
                    onClick={() => confirmRemove(note.id)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting[note.id] && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}

                    {deleting[note.id] ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
