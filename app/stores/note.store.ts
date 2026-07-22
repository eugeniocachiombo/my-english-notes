import axios from "axios";
const url = '/api/notes';

export async function getNotes() {
  const result = await axios.get(url);
  return result.data; 
}


export async function createNote(note: object) {
  return await axios.post(url, note);
}