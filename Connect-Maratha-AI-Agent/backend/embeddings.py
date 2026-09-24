import json
import os

from sentence_transformers import SentenceTransformer


# ==================================================
# FILE PATHS
# ==================================================

BASE_DIR = os.path.dirname(__file__)

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "connect_maratha_content.json"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "embeddings.json"
)


# ==================================================
# MODEL
# ==================================================

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

print("Loading embedding model...")

model = SentenceTransformer(MODEL_NAME)

print("Embedding model loaded.")


# ==================================================
# LOAD KNOWLEDGE BASE
# ==================================================

with open(
    DATA_FILE,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


print(
    "Loaded records:",
    len(data)
)


# ==================================================
# BUILD SEARCH TEXT
# ==================================================

def build_search_text(item):
    """
    Creates the text that will be converted into
    an embedding.

    Supports:

    Old format:
        question
        topic
        category

    New format:
        questions[]
        keywords[]
        topic
        category
    """

    parts = []


    # ------------------------------------------------
    # TOPIC
    # ------------------------------------------------

    topic = item.get(
        "topic",
        ""
    )

    if topic:
        parts.append(
            str(topic)
        )


    # ------------------------------------------------
    # CATEGORY
    # ------------------------------------------------

    category = item.get(
        "category",
        ""
    )

    if category:
        parts.append(
            str(category)
        )


    # ------------------------------------------------
    # OLD QUESTION FIELD
    # ------------------------------------------------

    question = item.get(
        "question",
        ""
    )

    if question:
        parts.append(
            str(question)
        )


    # ------------------------------------------------
    # NEW QUESTIONS ARRAY
    # ------------------------------------------------

    questions = item.get(
        "questions",
        []
    )

    if isinstance(
        questions,
        list
    ):

        for q in questions:

            if q:
                parts.append(
                    str(q)
                )


    # ------------------------------------------------
    # NEW KEYWORDS ARRAY
    # ------------------------------------------------

    keywords = item.get(
        "keywords",
        []
    )

    if isinstance(
        keywords,
        list
    ):

        for keyword in keywords:

            if keyword:
                parts.append(
                    str(keyword)
                )


    # ------------------------------------------------
    # OPTIONAL TAGS
    # ------------------------------------------------

    tags = item.get(
        "tags",
        []
    )

    if isinstance(
        tags,
        list
    ):

        for tag in tags:

            if tag:
                parts.append(
                    str(tag)
                )


    # ------------------------------------------------
    # ANSWERS
    # ------------------------------------------------
    # Keeping answers here helps semantic retrieval,
    # while main.py still chooses the requested
    # language when returning the response.
    # ------------------------------------------------

    answer = item.get(
        "answer",
        {}
    )

    if isinstance(
        answer,
        dict
    ):

        english_answer = answer.get(
            "en",
            ""
        )

        hindi_answer = answer.get(
            "hi",
            ""
        )

        marathi_answer = answer.get(
            "mr",
            ""
        )

        if english_answer:
            parts.append(
                str(english_answer)
            )

        if hindi_answer:
            parts.append(
                str(hindi_answer)
            )

        if marathi_answer:
            parts.append(
                str(marathi_answer)
            )


    # ------------------------------------------------
    # FINAL SEARCH TEXT
    # ------------------------------------------------

    return " ".join(
        part.strip()
        for part in parts
        if part and str(part).strip()
    )


# ==================================================
# CREATE EMBEDDING DOCUMENTS
# ==================================================

embedding_documents = []

print()
print("Building searchable documents...")
print()


for item in data:

    text = build_search_text(
        item
    )

    embedding_documents.append(
        text
    )


    # Optional console information
    print(
        f'{item.get("id", "")} -> '
        f'{item.get("topic", "")}'
    )


print()
print(
    "Searchable documents created:",
    len(embedding_documents)
)


# ==================================================
# CREATE EMBEDDINGS
# ==================================================

print()
print("Creating embeddings...")
print()

embeddings = model.encode(
    embedding_documents,
    show_progress_bar=True,
    normalize_embeddings=True
)


# ==================================================
# SAVE EMBEDDINGS
# ==================================================

output_data = []


for item, embedding in zip(
    data,
    embeddings
):

    answer = item.get(
        "answer",
        {}
    )


    # ------------------------------------------------
    # Preserve questions
    # ------------------------------------------------

    questions = item.get(
        "questions",
        []
    )

    if not isinstance(
        questions,
        list
    ):

        questions = []


    # ------------------------------------------------
    # Preserve keywords
    # ------------------------------------------------

    keywords = item.get(
        "keywords",
        []
    )

    if not isinstance(
        keywords,
        list
    ):

        keywords = []


    # ------------------------------------------------
    # Create output record
    # ------------------------------------------------

    output_data.append({

        "id": item.get(
            "id",
            ""
        ),

        "topic": item.get(
            "topic",
            ""
        ),

        "category": item.get(
            "category",
            ""
        ),

        # Existing format
        "question": item.get(
            "question",
            ""
        ),

        # New format
        "questions": questions,

        "keywords": keywords,

        "answer": {
            "en": answer.get(
                "en",
                ""
            ),

            "hi": answer.get(
                "hi",
                ""
            ),

            "mr": answer.get(
                "mr",
                ""
            )
        },

        "source": item.get(
            "source",
            ""
        ),

        "embedding": embedding.tolist()
    })


# ==================================================
# SAVE JSON
# ==================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        output_data,
        file,
        ensure_ascii=False,
        indent=2
    )


# ==================================================
# COMPLETION
# ==================================================

print()
print(
    "=============================================="
)

print(
    "Embeddings created successfully!"
)

print(
    "Total documents:",
    len(output_data)
)

print(
    "Saved to:",
    OUTPUT_FILE
)

print(
    "=============================================="
)


if __name__ == "__main__":

    print()
    print(
        "Embedding generation completed."
    )