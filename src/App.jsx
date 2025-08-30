import { useState, useRef } from "react";

function DictionaryApp() {
  const [searchWord, setSearchWord] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // keep AbortController across renders
  const controllerRef = useRef(null);

  async function searchWords() {
    const q = searchWord.trim();
    if (!q) return;

    // cancel any previous request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    try {
      setError("");
      setResult(null);
      setLoading(true);

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          q
        )}`,
        { signal: controllerRef.current.signal }
      );

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No entries returned.");
      }

      setResult(data[0]);
    } catch (error) {
      if (err.name === "AbortError") {
        // request was canceled → don’t set error
        return;
      }
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-5xl font-bold ">📖 Dictionary App</h1>
      <div className="flex items-center justify-center h-75">
        <input
          type="text"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          placeholder="Enter a word"
          className="flex-1 border rounded px-3 py-2 mr-2"
        />
        <button
          onClick={searchWords}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {loading && <p className="text-gray-500">⏳ Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 text-left bg-gray-50 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">{result.word}</h2>
          {result.meanings?.[0]?.definitions?.[0]?.definition && (
            <p className="text-gray-700">
              {result.meanings[0].definitions[0].definition}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default DictionaryApp;
