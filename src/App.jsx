import React, { useState, useEffect, useRef } from "react";

const IMAGE_APIS = [
  // Unsplash
  () =>
    fetch(`https://api.unsplash.com/photos/random?orientation=squarish&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`)
      .then(r => r.json())
      .then(j => ({
        url: j.urls?.regular,
        label: j.alt_description || j.description || "photo",
        hint: "This could be an object, scene, or a moment captured in time.",
        extraHints: [
          "Look closely at the environment and shapes.",
          "Focus on the composition — is it a place, object, or activity?",
          "Think beyond the obvious."
        ]
      })),
  // Lorem Picsum
  () =>
    fetch("https://picsum.photos/400")
      .then(r => ({
        url: r.url,
        label: "photo",
        hint: "A random abstract or landscape image.",
        extraHints: [
          "This is a generic photo — look for patterns.",
          "Shapes and colors might help you guess.",
        ]
      })),
  // Dog API
  () =>
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(r => r.json())
      .then(j => ({
        url: j.message,
        label: "dog",
        hint: "This is a domesticated animal often considered man’s best friend.",
        extraHints: [
          "It’s a common pet.",
          "Often seen walking with humans.",
          "Loyal and friendly species."
        ]
      })),
  // Cat API
  () =>
    fetch("https://api.thecatapi.com/v1/images/search")
      .then(r => r.json())
      .then(j => ({
        url: j[0].url,
        label: "cat",
        hint: "This animal is small, agile, and known to purr.",
        extraHints: [
          "Often climbs onto furniture.",
          "Independent and curious.",
          "Lives in many homes around the world."
        ]
      })),
  // Fox API
  () =>
    fetch("https://randomfox.ca/floof/")
      .then(r => r.json())
      .then(j => ({
        url: j.image,
        label: "fox",
        hint: "This animal is wild, has orange fur and a bushy tail.",
        extraHints: [
          "Found in forests or countryside.",
          "Clever and agile animal.",
          "Known for its alert eyes and pointy ears."
        ]
      })),
  // Wikimedia Random
  () =>
    fetch("https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=6&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*")
      .then(r => r.json())
      .then(j => {
        const pages = j.query?.pages ? Object.values(j.query.pages) : [];
        if (!pages.length) throw new Error("No image");
        const img = pages[0].imageinfo[0];
        return {
          url: img.url,
          label: pages[0].title.replace(/File:/, "").replace(/_/g, " "),
          hint: "A famous place, monument, or historical image.",
          extraHints: [
            "Could be related to history or culture.",
            "Might appear in documentaries or textbooks.",
            "Sometimes photographed by tourists."
          ]
        };
      }),
];

function getRandomImageData() {
  const api = IMAGE_APIS[Math.floor(Math.random() * IMAGE_APIS.length)];
  return api();
}

function normalizeLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [label, setLabel] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blur, setBlur] = useState(20);
  const [hint, setHint] = useState("");
  const [extraHints, setExtraHints] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const inputRef = useRef();

  const loadNewImage = async () => {
    setLoading(true);
    setRevealed(false);
    setGuess("");
    setScore(100);
    setAttempts(0);
    setBlur(20);
    setHint("");
    setExtraHints([]);
    setHintIndex(0);

    let data = null;
    for (let i = 0; i < 5; i++) {
      try {
        data = await getRandomImageData();
        if (data && data.label && normalizeLabel(data.label) !== "image" && normalizeLabel(data.label) !== "photo")
          break;
      } catch {}
    }

    if (!data) {
      setLoading(false);
      setImageUrl("");
      setLabel("");
      setHint("Failed to load image. Try again.");
      return;
    }

    setImageUrl(data.url);
    setLabel(data.label);
    setHint(data.hint);
    setExtraHints(data.extraHints || []);
    setHintIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    loadNewImage();
  }, []);

  const handleGuess = (e) => {
    e.preventDefault();
    if (revealed) return;
    if (normalizeLabel(guess) === normalizeLabel(label)) {
      setRevealed(true);
      setBlur(0);
    } else {
      setAttempts(a => a + 1);
      setScore(s => Math.max(0, s - 20));
      setBlur(b => Math.max(0, b - 4));
      setHintIndex(idx => {
        if (extraHints.length === 0) return idx;
        const nextIdx = (idx + 1) % extraHints.length;
        setHint(extraHints[nextIdx]);
        return nextIdx;
      });
      if (score <= 20) {
        setRevealed(true);
        setBlur(0);
      }
    }
    setGuess("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ fontFamily: "monospace", background: "#222", color: "#fff", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
      <h1>PixelPeek</h1>
      <p>Guess the subject of the pixelated image! Each wrong attempt lowers your score and makes the image clearer.</p>
      <div style={{ margin: "2rem auto", width: 400, height: 400, position: "relative" }}>
        {loading ? (
          <div style={{ lineHeight: "400px" }}>Loading...</div>
        ) : (
          <img
            src={imageUrl}
            alt="Guess me!"
            style={{
              width: 400,
              height: 400,
              objectFit: "cover",
              filter: `blur(${blur}px)`,
              imageRendering: "pixelated",
              borderRadius: 16,
              border: "4px solid #444",
              transition: "filter 0.3s"
            }}
          />
        )}
        {revealed && !loading && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "1rem",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            fontSize: "1.5rem"
          }}>
            Answer: <b>{label}</b>
          </div>
        )}
      </div>
      <div style={{
        margin: "1rem auto",
        fontSize: "1.2rem",
        background: "#333",
        padding: "0.7rem 1.2rem",
        borderRadius: 10,
        minHeight: 40,
        maxWidth: 500
      }}>
        <b>Hint:</b> {hint}
      </div>
      <form onSubmit={handleGuess} style={{ margin: "1rem auto" }}>
        <input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          disabled={loading || revealed}
          placeholder="Your guess..."
          style={{
            fontSize: "1.2rem",
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #888",
            marginRight: "1rem"
          }}
        />
        <button
          type="submit"
          disabled={loading || revealed}
          style={{
            fontSize: "1.2rem",
            padding: "0.5rem 1.5rem",
            borderRadius: 8,
            background: "#4caf50",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Guess
        </button>
      </form>
      <div style={{ margin: "1rem auto", fontSize: "1.2rem" }}>
        Score: <b>{score}</b> &nbsp; | &nbsp; Attempts: <b>{attempts}</b>
      </div>
      {revealed && (
        <button
          onClick={loadNewImage}
          style={{
            fontSize: "1.1rem",
            padding: "0.5rem 1.5rem",
            borderRadius: 8,
            background: "#2196f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          Next Image
        </button>
      )}
    </div>
  );
}

export default App;
