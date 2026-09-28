import os
import json
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI

from .. import schemas, auth_utils, models

router = APIRouter(prefix="/ai", tags=["ai"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_BASE_URL = os.getenv("LLM_BASE_URL")             # optional: other providers
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")    # default = original behavior


def get_client():
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI feature not configured — set OPENAI_API_KEY in .env to enable this.",
        )
    return OpenAI(api_key=OPENAI_API_KEY, base_url=LLM_BASE_URL or None)


SYSTEM_PROMPT = (
    "You extract structured data from job descriptions. "
    "Respond with STRICT JSON only, no markdown fences, no extra text. "
    "Schema: {\"company_name\": string|null, \"role_title\": string|null, "
    "\"key_skills\": string[]}"
)


@router.post("/parse-jd", response_model=schemas.JDParseResponse)
def parse_jd(
    payload: schemas.JDParseRequest,
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": payload.jd_text},
            ],
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()

        # Defensive cleanup in case the model wraps output in ```json fences
        if raw.startswith("```"):
            raw = raw.strip("`")
            raw = raw.replace("json\n", "", 1)

        data = json.loads(raw)
        return schemas.JDParseResponse(**data)

    except (json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(
            status_code=422,
            detail="Could not parse AI response. Please fill the form manually.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")