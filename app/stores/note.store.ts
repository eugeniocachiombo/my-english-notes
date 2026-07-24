import axios from "axios";
const url = '/api/notes';

export async function getNotes() {
  const result = await axios.get(url);
  return result.data; 
}


export async function createNote(note: object) {
  return await axios.post(url, note);
}

export async function updateNote(note: object){
  return await axios.put(url,  note);
}

export async function removeNote(id: number){
  return await axios.delete(url, { data: { id } });
}