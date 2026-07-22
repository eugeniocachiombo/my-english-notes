import axios from "axios";
const url = '/api/notes';

export async function getNotes() {
  try {
    const result = await axios.get(url);
    return result.data;
  } catch (error: any) {
    console.log("API Error:", error.message);
  }
}


export async function createNote(note: object) {
  try {
    return await axios.post(url, note);
  } catch (error: any) {
    console.log("API Error:", error.message);
  }
}