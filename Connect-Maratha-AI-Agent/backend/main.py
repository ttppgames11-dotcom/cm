

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import requests
import re
import unicodedata
import json
import os
from datetime import datetime
import time

from rag import search_rag


# ============================================================
# APP
# ============================================================

app = FastAPI(title="Connect Maratha AI Agent")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# CONFIGURATION
# ============================================================

SIMILARITY_THRESHOLD = 0.55

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

OLLAMA_MODEL = "llama3.2:latest"

OLLAMA_TIMEOUT = 120


# ============================================================
# CONVERSATION HISTORY
# ============================================================

conversation_history = {}

# Reduced only to make Ollama response faster
MAX_HISTORY_MESSAGES = 4


# ============================================================
# TECHNICAL SUPPORT FILE
# ============================================================

SUPPORT_FILE = os.path.join(
    os.path.dirname(__file__),
    "technical_support_requests.json"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):

    message: str

    language: str = "en"

    session_id: str = "default"


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize_text(text: str) -> str:

    text = unicodedata.normalize(
        "NFKC",
        text
    )

    text = text.lower()

    text = re.sub(
        r"[^\w\s\u0900-\u097f]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# NORMALIZE LANGUAGE
# ============================================================

def normalize_language(language: str) -> str:

    if not language:
        return "en"

    language = language.lower().strip()

    if language in ["mr", "marathi"]:
        return "mr"

    if language in ["hi", "hindi"]:
        return "hi"

    return "en"


# ============================================================
# LANGUAGE NAME
# ============================================================

def get_language_name(language: str) -> str:

    language = normalize_language(language)

    if language == "mr":
        return "Marathi"

    if language == "hi":
        return "Hindi"

    return "English"


# ============================================================
# LANGUAGE DETECTION
# ============================================================

def detect_language(text: str) -> str:

    normalized = normalize_text(text)

    marathi_words = [
        "काय",
        "कोण",
        "कोणते",
        "कोणती",
        "आहे",
        "होते",
        "बद्दल",
        "माहिती",
        "कधी",
        "कुठे",
        "कसे",
        "कशासाठी",
        "सांगा",
        "म्हणजे",
        "इतिहास"
    ]

    hindi_words = [
        "क्या",
        "कौन",
        "कौन थे",
        "कौन था",
        "है",
        "था",
        "थे",
        "के बारे में",
        "जानकारी",
        "कब",
        "कहाँ",
        "कैसे",
        "इतिहास"
    ]

    marathi_score = sum(
        1
        for word in marathi_words
        if word in normalized
    )

    hindi_score = sum(
        1
        for word in hindi_words
        if word in normalized
    )

    if marathi_score > hindi_score:
        return "mr"

    if hindi_score > marathi_score:
        return "hi"

    if re.search(
        r"[\u0900-\u097f]",
        text
    ):

        if any(
            char in text
            for char in ["ळ", "ऱ", "य़"]
        ):
            return "mr"

        return "hi"

    return "en"


# ============================================================
# GREETING DETECTION
# ============================================================

def is_greeting(text: str) -> bool:

    normalized = normalize_text(text)

    greetings = [
        "hi",
        "hello",
        "hey",
        "namaste",
        "नमस्ते",
        "नमस्कार",
        "हॅलो",
        "हेलो"
    ]

    return any(
        normalized == greeting
        or normalized.startswith(
            greeting + " "
        )
        for greeting in greetings
    )


# ============================================================
# MULTILINGUAL GREETING
# ============================================================

def get_greeting(language: str) -> str:

    language = normalize_language(language)

    if language == "mr":

        return (
            "नमस्कार! 🙏 "
            "कनेक्ट मराठा एआय सहाय्यक मध्ये आपले स्वागत आहे. "
            "आपण कनेक्ट मराठा आणि मराठा इतिहासाशी संबंधित प्रश्न विचारू शकता."
        )

    if language == "hi":

        return (
            "नमस्ते! 🙏 "
            "कनेक्ट मराठा एआई सहायक में आपका स्वागत है। "
            "आप कनेक्ट मराठा और मराठा इतिहास से संबंधित प्रश्न पूछ सकते हैं।"
        )

    return (
        "Hello! 🙏 "
        "Welcome to Connect Maratha AI Assistant. "
        "You can ask questions related to Connect Maratha "
        "and Maratha history."
    )


# ============================================================
# NO MATCH MESSAGE
# ============================================================

def get_no_match_message(language: str) -> str:

    language = normalize_language(language)

    if language == "mr":

        return (
            "माफ करा, कनेक्ट मराठा नॉलेज बेसमध्ये "
            "या प्रश्नाशी संबंधित माहिती आढळली नाही."
        )

    if language == "hi":

        return (
            "क्षमा करें, कनेक्ट मराठा नॉलेज बेस में "
            "इस प्रश्न से संबंधित जानकारी नहीं मिली।"
        )

    return (
        "Sorry, no matching information was found "
        "in the Connect Maratha knowledge base."
    )


# ============================================================
# BUILD RAG CONTEXT
# ============================================================

def build_rag_context(
    results,
    language
):

    context_parts = []

    for index, result in enumerate(
        results,
        start=1
    ):

        question = result.get(
            "question",
            ""
        )

        answer = result.get(
            "answer",
            ""
        )

        category = result.get(
            "category",
            ""
        )

        # IMPORTANT:
        # Send only requested language to Ollama
        if isinstance(answer, dict):

            answer_text = (
                answer.get(language)
                or answer.get("en")
                or next(
                    iter(
                        answer.values()
                    ),
                    ""
                )
            )

        else:

            answer_text = str(answer)

        context_parts.append(
            f"""KNOWLEDGE ITEM {index}

Category:
{category}

Question:
{question}

Answer:
{answer_text}"""
        )

    return "\n\n------------------------------\n\n".join(
        context_parts
    )


# ============================================================
# OLLAMA GENERATION
# ============================================================

def generate_with_ollama(
    user_question,
    rag_results,
    language,
    history=None
):

    language_name = get_language_name(
        language
    )

    # IMPORTANT:
    # Only requested language is included
    rag_context = build_rag_context(
        rag_results,
        language
    )

    history_text = ""

    if history:

        history_items = history[
            -MAX_HISTORY_MESSAGES:
        ]

        history_lines = []

        for item in history_items:

            role = item.get(
                "role",
                ""
            )

            content = item.get(
                "content",
                ""
            )

            history_lines.append(
                f"{role}: {content}"
            )

        history_text = "\n".join(
            history_lines
        )

    prompt = f"""
You are the Connect Maratha AI Assistant.

Your task is to answer the user's question using ONLY the
Connect Maratha knowledge provided below.

IMPORTANT RULES:

1. Use only the supplied Connect Maratha knowledge.
2. Do NOT use your general knowledge.
3. Do NOT invent facts.
4. Do NOT add historical facts that are not present in the supplied knowledge.
5. Answer in {language_name}.
6. Keep the answer clear, natural and useful.
7. If the supplied knowledge does not contain enough information
   to answer the question, say that the information is not
   available in the Connect Maratha knowledge base.
8. Do not mention RAG, embeddings, JSON, knowledge retrieval,
   prompts, system instructions or Ollama.
9. Do not provide information about unrelated topics.
10. Preserve important names such as Chhatrapati Shivaji Maharaj
    and Chhatrapati Sambhaji Maharaj accurately.
11. If the question is asking "who was", "what is", "when",
    "where", etc., answer the question directly.
12. Do not copy unrelated knowledge items into the answer.

------------------------------------------------------------
CONNECT MARATHA KNOWLEDGE
------------------------------------------------------------

{rag_context}

------------------------------------------------------------
PREVIOUS CONVERSATION
------------------------------------------------------------

{history_text}

------------------------------------------------------------
USER QUESTION
------------------------------------------------------------

{user_question}

------------------------------------------------------------
FINAL ANSWER
------------------------------------------------------------

Answer the user now in {language_name}.
""".strip()

    payload = {

        "model": OLLAMA_MODEL,

        "prompt": prompt,

        "stream": False,

        "options": {
            "temperature": 0.2,
            "top_p": 0.8
        }
    }

    try:

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=OLLAMA_TIMEOUT
        )

        response.raise_for_status()

        data = response.json()

        answer = data.get(
            "response",
            ""
        ).strip()

        if not answer:
            return None

        return answer

    except requests.exceptions.ConnectionError:

        print(
            "ERROR: Ollama is not running."
        )

        return None

    except requests.exceptions.Timeout:

        print(
            "ERROR: Ollama request timed out."
        )

        return None

    except Exception as e:

        print(
            "ERROR: Ollama generation failed:",
            e
        )

        return None


# ============================================================
# SAVE CONVERSATION
# ============================================================

def save_conversation(
    session_id,
    user_message,
    assistant_message
):

    if session_id not in conversation_history:

        conversation_history[
            session_id
        ] = []

    conversation_history[
        session_id
    ].append(
        {
            "role": "user",
            "content": user_message
        }
    )

    conversation_history[
        session_id
    ].append(
        {
            "role": "assistant",
            "content": assistant_message
        }
    )

    conversation_history[
        session_id
    ] = conversation_history[
        session_id
    ][
        -MAX_HISTORY_MESSAGES:
    ]


# ============================================================
# ENTITY EXTRACTION
# ============================================================

def get_query_entities(query):

    normalized = normalize_text(query)

    entities = []

    if (
        "shivaji" in normalized
        or "शिवाजी" in normalized
    ):
        entities.append("shivaji")

    if (
        "sambhaji" in normalized
        or "संभाजी" in normalized
        or "संभाजीराजे" in normalized
    ):
        entities.append("sambhaji")

    if (
        "connect maratha" in normalized
        or "कनेक्ट मराठा" in normalized
    ):
        entities.append(
            "connect_maratha"
        )

    if (
        "akhil bharatiya maratha mahasangh"
        in normalized
        or "अखिल भारतीय मराठा महासंघ"
        in normalized
    ):
        entities.append(
            "maratha_mahasangh"
        )

    return entities


# ============================================================
# RAG RESULT RANKING
# ============================================================

def rank_rag_results(
    query,
    results
):

    normalized_query = normalize_text(
        query
    )

    query_words = set(
        normalized_query.split()
    )

    ranked = []

    for result in results:

        score = float(
            result.get(
                "score",
                0
            )
        )

        question = normalize_text(
            str(
                result.get(
                    "question",
                    ""
                )
            )
        )

        category = normalize_text(
            str(
                result.get(
                    "category",
                    ""
                )
            )
        )

        answer = result.get(
            "answer",
            ""
        )

        if isinstance(answer, dict):

            answer_text = " ".join(
                str(value)
                for value in answer.values()
            )

        else:

            answer_text = str(answer)

        answer_normalized = normalize_text(
            answer_text
        )

        combined_text = (
            question
            + " "
            + category
            + " "
            + answer_normalized
        )

        combined_words = set(
            combined_text.split()
        )

        # WORD OVERLAP

        if query_words:

            overlap = (
                len(
                    query_words
                    & combined_words
                )
                / len(query_words)
            )

            score += overlap * 0.10

        # SHIVAJI

        if (
            "shivaji" in normalized_query
            or "शिवाजी" in normalized_query
        ):

            if (
                "shivaji" in question
                or "शिवाजी" in question
            ):
                score += 0.12

            if (
                "sambhaji" in question
                or "संभाजी" in question
            ):
                score -= 0.05

        # SAMBHAJI

        if (
            "sambhaji" in normalized_query
            or "संभाजी" in normalized_query
        ):

            if (
                "sambhaji" in question
                or "संभाजी" in question
                or "sambhaji" in combined_text
                or "संभाजी" in combined_text
            ):
                score += 0.20

        # PESHAWA

        if (
            "peshwa" in normalized_query
            or "पेशवा" in normalized_query
        ):

            if (
                "peshwa" in combined_text
                or "पेशवा" in combined_text
            ):
                score += 0.15

        # ASHTAPRadhan

        if (
            "ashtapradhan" in normalized_query
            or "अष्टप्रधान" in normalized_query
            or "अष्ट प्रधान" in normalized_query
        ):

            if (
                "ashtapradhan" in combined_text
                or "अष्टप्रधान" in combined_text
                or "अष्ट प्रधान" in combined_text
            ):
                score += 0.20

        # ADMINISTRATION

        if (
            "administration" in normalized_query
            or "प्रशासन" in normalized_query
            or "राज्यकारभार" in normalized_query
        ):

            if (
                "administration" in combined_text
                or "प्रशासन" in combined_text
                or "राज्यकारभार" in combined_text
            ):
                score += 0.15

        # CORONATION

        if (
            "coronation" in normalized_query
            or "coronated" in normalized_query
            or "shivrajyabhishek" in normalized_query
            or "राज्याभिषेक" in normalized_query
        ):

            if (
                "coronation" in combined_text
                or "shivrajyabhishek" in combined_text
                or "राज्याभिषेक" in combined_text
            ):
                score += 0.15

        # HISTORY / DATE

        if (
            "history" in normalized_query
            or "इतिहास" in normalized_query
            or re.search(
                r"\b(16|17|18)\d{2}\b",
                normalized_query
            )
        ):

            if (
                "history" in category
                or "इतिहास" in category
                or "timeline" in category
            ):
                score += 0.10

        # CLAMP SCORE

        score = min(
            max(score, 0.0),
            1.0
        )

        result_copy = dict(result)

        result_copy["original_score"] = float(
            result.get(
                "score",
                0
            )
        )

        result_copy["score"] = score

        ranked.append(
            result_copy
        )

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return ranked


# ============================================================
# CHAT ENDPOINT
# ============================================================

@app.post("/chat")
def chat(data: ChatRequest):

   # start_time = time.perf_counter()

    user_message = data.message.strip()

    language = normalize_language(
        data.language
    )

    session_id = (
        data.session_id
        or "default"
    )

    print()
    print(
        "=================================================="
    )

    print(
        "CHAT REQUEST"
    )

    print(
        "=================================================="
    )

    print(
        "USER:",
        user_message
    )

    print(
        "LANGUAGE:",
        language
    )

    print(
        "SESSION:",
        session_id
    )

    # ========================================================
    # EMPTY MESSAGE
    # ========================================================

    if not user_message:

        return {
            "response": get_no_match_message(
                language
            ),
            "sources": []
        }

    # ========================================================
    # GREETING
    # ========================================================

    if is_greeting(user_message):

        greeting = get_greeting(
            language
        )

        save_conversation(
            session_id,
            user_message,
            greeting
        )

        return {
            "response": greeting,
            "sources": []
        }

    # ========================================================
    # RAG SEARCH
    # ========================================================

    print()
    print(
        "========== SEARCHING CONNECT MARATHA KNOWLEDGE =========="
    )

    rag_results = search_rag(
        user_message,
        top_k=5
    )

    # ========================================================
    # RANK RESULTS
    # ========================================================

    ranked_results = rank_rag_results(
        user_message,
        rag_results
    )

    print()
    print(
        "========== RANKED RAG RESULTS =========="
    )

    for index, result in enumerate(
        ranked_results,
        start=1
    ):

        print(
            index,
            result.get(
                "question",
                ""
            )
        )

        print(
            "Original:",
            result.get(
                "original_score",
                0
            )
        )

        print(
            "Final:",
            result.get(
                "score",
                0
            )
        )

        print(
            "----------------------------------------"
        )

    # ========================================================
    # FILTER LOW-SCORE RESULTS
    # ========================================================

    relevant_results = [
        result
        for result in ranked_results
        if result.get(
            "score",
            0
        ) >= SIMILARITY_THRESHOLD
    ]

    print()

    print(
        "RELEVANT RESULTS:",
        len(relevant_results)
    )

    # ========================================================
    # NO MATCH
    # ========================================================

    if not relevant_results:

        no_match = get_no_match_message(
            language
        )

        save_conversation(
            session_id,
            user_message,
            no_match
        )

        print(
            "NO MATCH FOUND"
        )

        return {
            "response": no_match,
            "sources": []
        }

    # ========================================================
    # BEST RESULT
    # ========================================================

    selected_result = relevant_results[0]

    print()

    print(
        "========== SELECTED RAG RESULT =========="
    )

    print(
        "QUESTION:",
        selected_result.get(
            "question",
            ""
        )
    )

    print(
        "CATEGORY:",
        selected_result.get(
            "category",
            ""
        )
    )

    print(
        "SCORE:",
        selected_result.get(
            "score",
            0
        )
    )

    # ========================================================
    # CONVERSATION HISTORY
    # ========================================================

    history = conversation_history.get(
        session_id,
        []
    )

    # ========================================================
    # IMPORTANT:
    # SEND ONLY TOP 3 RESULTS TO OLLAMA
    # ========================================================

    selected_results = relevant_results[:3]

    # ========================================================
    # OLLAMA GENERATION
    # ========================================================

    print()
    print(
        "========== SENDING TO OLLAMA =========="
    )

    print(
        "MODEL:",
        OLLAMA_MODEL
    )

    print(
        "LANGUAGE:",
        get_language_name(language)
    )

    print(
        "RAG RESULTS SENT TO OLLAMA:",
        len(selected_results)
    )

    ollama_answer = generate_with_ollama(

        user_question=user_message,

        rag_results=selected_results,

        language=language,

        history=history
    )

    # ========================================================
    # OLLAMA FAILURE
    # ========================================================

    if not ollama_answer:

        print(
            "OLLAMA DID NOT RETURN AN ANSWER."
        )

        fallback_answer = selected_result.get(
            "answer",
            ""
        )

        if isinstance(
            fallback_answer,
            dict
        ):

            fallback_answer = (
                fallback_answer.get(
                    language
                )
                or fallback_answer.get(
                    "en"
                )
                or next(
                    iter(
                        fallback_answer.values()
                    ),
                    ""
                )
            )

        fallback_answer = str(
            fallback_answer
        ).strip()

        save_conversation(
            session_id,
            user_message,
            fallback_answer
        )

        return {
            "response": fallback_answer,
            "sources": []
        }

    # ========================================================
    # SAVE CONVERSATION
    # ========================================================

    save_conversation(
        session_id,
        user_message,
        ollama_answer
    )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================
    
   #response_time = time.perf_counter() - start_time

    # return 
    # {
        # "response": final_response,
        # "sources": sources,
       # "response_time": round(response_time, 2)
           # } 
    print()

    print(
        "========== FINAL OLLAMA RESPONSE =========="
    )

    print(
        ollama_answer
    )

    print(
        "=================================================="
    )

    return {
        "response": ollama_answer,
        "sources": []
    }


# ============================================================
# TECHNICAL SUPPORT ENDPOINT
# ============================================================

@app.post("/technical-support")
def technical_support(data: dict):

    mobile = str(
        data.get(
            "mobile",
            ""
        )
    ).strip()

    email = str(
        data.get(
            "email",
            ""
        )
    ).strip()

    issue = str(
        data.get(
            "issue",
            ""
        )
    ).strip()

    language = normalize_language(
        data.get(
            "language",
            "en"
        )
    )

    session_id = str(
        data.get(
            "session_id",
            "default"
        )
    )

    print()
    print(
        "========== TECHNICAL SUPPORT =========="
    )

    print(
        "Mobile:",
        mobile
    )

    print(
        "Email:",
        email
    )

    print(
        "Issue:",
        issue
    )

    print(
        "Language:",
        language
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    if not re.fullmatch(
        r"\d{10}",
        mobile
    ):

        return {
            "success": False,
            "message": "Invalid mobile number."
        }

    if not re.fullmatch(
        r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
        email
    ):

        return {
            "success": False,
            "message": "Invalid email address."
        }

    if not issue:

        return {
            "success": False,
            "message": "Issue is required."
        }

    # ========================================================
    # CREATE REQUEST
    # ========================================================

    request_data = {

        "mobile": mobile,

        "email": email,

        "issue": issue,

        "language": language,

        "session_id": session_id,

        "timestamp": datetime.now().isoformat()
    }

    # ========================================================
    # READ EXISTING REQUESTS
    # ========================================================

    requests_list = []

    if os.path.exists(
        SUPPORT_FILE
    ):

        try:

            with open(
                SUPPORT_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                existing_data = json.load(
                    file
                )

                if isinstance(
                    existing_data,
                    list
                ):

                    requests_list = existing_data

        except Exception as e:

            print(
                "Could not read support file:",
                e
            )

    # ========================================================
    # ADD REQUEST
    # ========================================================

    requests_list.append(
        request_data
    )

    # ========================================================
    # SAVE
    # ========================================================

    try:

        with open(
            SUPPORT_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                requests_list,
                file,
                ensure_ascii=False,
                indent=4
            )

        print(
            "Saved to:",
            SUPPORT_FILE
        )

        return {
            "success": True,
            "message": "Technical support request submitted successfully."
        }

    except Exception as e:

        print(
            "Support save error:",
            e
        )

        return {
            "success": False,
            "message": "Unable to save support request."
        }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Connect Maratha AI Agent is running.",
        "model": OLLAMA_MODEL,
        "rag": "enabled",
        "ollama": "enabled"
    }