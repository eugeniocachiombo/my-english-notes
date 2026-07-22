const API_URL = "/api/notes";


async function request(url:string, options = {}) {
  try {
    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Ocorreu um erro na requisição");
    }

    return data;

  } catch (error: any) {
    console.error("API Error:", error.message);

    throw error;
  }
}


export async function getNotes() {
  return request(API_URL);
}


export async function createNote(note:object) {
  return request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });
}