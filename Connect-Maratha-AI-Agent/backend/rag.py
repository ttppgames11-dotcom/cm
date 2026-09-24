import json
import re
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

MINIMUM_SCORE = 0.35
CANDIDATE_COUNT = 20
DEFAULT_TOP_K = 5

BASE_DIR = Path(__file__).resolve().parent
EMBEDDINGS_FILE = BASE_DIR / "data" / "embeddings.json"


# ============================================================
# LOAD MODEL
# ============================================================

model = SentenceTransformer(MODEL_NAME)


# ============================================================
# LOAD EMBEDDINGS
# ============================================================

with open(EMBEDDINGS_FILE, "r", encoding="utf-8") as f:
    documents = json.load(f)


# ============================================================
# OPTIMIZATION
# Convert all document embeddings into one NumPy matrix
# This avoids converting every embedding during every search.
# ============================================================

embedding_matrix = np.asarray(
    [doc["embedding"] for doc in documents],
    dtype=np.float32
)

# Normalize embeddings once
if len(embedding_matrix) > 0:
    norms = np.linalg.norm(
        embedding_matrix,
        axis=1,
        keepdims=True
    )

    embedding_matrix = embedding_matrix / np.clip(
        norms,
        1e-12,
        None
    )


# ============================================================
# BUILD SEARCH TEXT
# ============================================================

def build_search_text(doc):
    parts = []

    for key in [
        "topic",
        "category",
        "question",
        "questions",
        "keywords",
        "tags"
    ]:
        value = doc.get(key)

        if isinstance(value, list):
            parts.extend(str(item) for item in value if item)

        elif value:
            parts.append(str(value))

    return " ".join(parts)


# ============================================================
# QUERY EXPANSION
# ============================================================

def expand_query(query):
    query_lower = query.lower()

    expansions = []

    # --------------------------------------------------------
    # Add your existing multilingual/query expansion rules here
    # --------------------------------------------------------

    if "shivaji" in query_lower or "शिवाजी" in query_lower:
        expansions.extend([
            "छत्रपती शिवाजी महाराज",
            "Chhatrapati Shivaji Maharaj",
            "शिवाजी महाराज"
        ])

    if "maratha" in query_lower or "मराठा" in query_lower:
        expansions.extend([
            "मराठा समाज",
            "Maratha community",
            "Maratha"
        ])

    if "connect maratha" in query_lower:
        expansions.extend([
            "Connect Maratha",
            "कनेक्ट मराठा"
        ])

    if expansions:
        return query + " " + " ".join(expansions)

    return query


# ============================================================
# SPECIAL BOOST
# ============================================================

def apply_special_boost(query, score, doc):
    query_lower = query.lower()

    search_text = build_search_text(doc).lower()

    special_terms = [
        "connect maratha",
        "मराठा",
        "maratha",
        "शिवाजी महाराज",
        "shivaji maharaj"
    ]

    for term in special_terms:
        if term in query_lower and term in search_text:
            score += 0.20
            break

    return score


# ============================================================
# RAG SEARCH
# ============================================================

def search_rag(query, top_k=DEFAULT_TOP_K):

    if not query or not query.strip():
        return []

    # --------------------------------------------------------
    # Expand query
    # --------------------------------------------------------

    expanded_query = expand_query(query)

    # --------------------------------------------------------
    # Generate query embedding
    # --------------------------------------------------------

    query_embedding = model.encode(
        expanded_query,
        convert_to_numpy=True
    ).astype(np.float32)

    # Normalize query embedding
    query_norm = np.linalg.norm(query_embedding)

    if query_norm > 0:
        query_embedding = query_embedding / query_norm

    # ========================================================
    # OPTIMIZED SIMILARITY SEARCH
    # ========================================================

    if len(embedding_matrix) == 0:
        return []

    # Calculate similarity with all documents at once
    scores = embedding_matrix @ query_embedding

    results = [
        {
            **documents[i],
            "score": float(scores[i])
        }
        for i in range(len(documents))
    ]

    # --------------------------------------------------------
    # Sort by similarity
    # --------------------------------------------------------

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # --------------------------------------------------------
    # Take candidate results
    # --------------------------------------------------------

    results = results[:CANDIDATE_COUNT]

    # ========================================================
    # APPLY TEXT / KEYWORD / SPECIAL BOOSTS
    # ========================================================

    query_words = set(
        re.findall(
            r"\w+",
            query.lower()
        )
    )

    for result in results:

        search_text = build_search_text(result).lower()

        # ----------------------------------------------------
        # String matching boost
        # ----------------------------------------------------

        if query.lower() in search_text:
            result["score"] += 0.10

        # ----------------------------------------------------
        # Keyword overlap boost
        # ----------------------------------------------------

        text_words = set(
            re.findall(
                r"\w+",
                search_text
            )
        )

        overlap = len(
            query_words.intersection(text_words)
        )

        if overlap > 0:
            result["score"] += min(
                overlap * 0.02,
                0.10
            )

        # ----------------------------------------------------
        # Special boost
        # ----------------------------------------------------

        result["score"] = apply_special_boost(
            query,
            result["score"],
            result
        )

    # --------------------------------------------------------
    # Sort again after boosting
    # --------------------------------------------------------

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # --------------------------------------------------------
    # Minimum score filtering
    # --------------------------------------------------------

    results = [
        result
        for result in results
        if result["score"] >= MINIMUM_SCORE
    ]

    # --------------------------------------------------------
    # Return top results
    # --------------------------------------------------------

    return results[:top_k]