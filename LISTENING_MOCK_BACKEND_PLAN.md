# Listening Full Mock - Backend Integration Plan

## CURRENT BACKEND STRUCTURE (OLD - Complex Nested)

### GET Endpoint
**URL:** `/api/multilevel/{exam_id}/listening/all/question/`
**ViewSet:** `ListeningAllPartsQuestionByExamViewSet`

**Response Structure:**
```json
{
  "exam_id": 1,
  "listening": {
    "part1": {
      "id": 123,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "answers": [
        {
          "id": 1,
          "position": 1,
          "answer": "Option A",
          "global_number": 1
        }
      ]
    },
    "part2": {
      "id": 456,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "positions": [
        {"position": 1, "global_number": 9},
        {"position": 2, "global_number": 10}
      ]
    },
    "part3": {
      "title": "...",
      "instruction": "...",
      "audio_url": "...",
      "questions": [
        {"id": 10, "text": "Speaker 1", "global_number": 14}
      ],
      "answers": [
        {"id": 20, "text": "Option A"}
      ]
    },
    "part4": {
      "title": "...",
      "instruction": "...",
      "audio_url": "...",
      "image_url": "...",
      "questions": [
        {"id": 30, "text": "Place 1", "global_number": 19}
      ],
      "answers": [
        {"id": 40, "text": "A"}
      ]
    },
    "part5": {
      "instruction": "...",
      "extracts": [
        {
          "id": 1,
          "extract": "Extract 1",
          "title": "...",
          "instruction": "...",
          "audio_url": "...",
          "questions": [
            {
              "id": 50,
              "question": "...",
              "global_number": 24,
              "answers": [
                {"id": 60, "answer": "Option A", "is_correct": false}
              ]
            }
          ]
        }
      ]
    },
    "part6": {
      "id": 789,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "positions": [
        {"position": 1, "global_number": 30}
      ]
    }
  }
}
```

**PROBLEMS:**
- ❌ No resource IDs for evaluation
- ❌ Complex nested structure with IDs scattered everywhere
- ❌ Frontend must track multiple ID types (question_id, answer_id, position)
- ❌ Not following Reading Mock professional pattern

### POST Endpoint
**URL:** `/api/multilevel/{exam_id}/listening/all/evaluate/`
**ViewSet:** `ListeningAllPartsEvaluateViewSet`

**Request Structure:**
```json
{
  "exam_id": 1,
  "answers": {
    "part1": {
      "1": {"question_id": 123, "answer_id": 1, "global_number": 1},
      "2": {"question_id": 123, "answer_id": 2, "global_number": 2}
    },
    "part2": {
      "9": {"question_id": 456, "position": 1, "answer": "Paris", "global_number": 9}
    },
    "part3": {
      "14": {"question_id": 10, "answer_question_id": 20, "global_number": 14}
    },
    "part4": {
      "19": {"question_id": 30, "answer_question_id": 40, "global_number": 19}
    },
    "part5": {
      "24": {"question_id": 50, "answer_id": 60, "global_number": 24}
    },
    "part6": {
      "30": {"question_id": 789, "position": 1, "answer": "Monday", "global_number": 30}
    }
  }
}
```

**Response Structure:**
```json
{
  "attempt_id": 999,
  "overall_score_percent": 85.71,
  "total_correct": 30,
  "total_questions": 35,
  "cefr_level": "C1",
  "parts": {
    "part1": {
      "correct_count": 6,
      "total_questions": 8,
      "score_percent": 75.0,
      "details": [
        {
          "question_id": 123,
          "answer_id": 1,
          "correct": true,
          "user_answer_text": "...",
          "correct_answer_id": 1,
          "correct_answer_text": "...",
          "global_number": 1
        }
      ]
    }
  }
}
```

**PROBLEMS:**
- ❌ Complex nested request format
- ❌ Response has nested details per part (not global 1-35)
- ❌ No part_details for accordion (like Reading Mock)
- ❌ Not following Reading Mock professional pattern

---

## NEW BACKEND STRUCTURE (Target - Simple Professional)

### GET Endpoint (SAME URL, NEW STRUCTURE)
**URL:** `/api/multilevel/{exam_id}/listening/all/question/`
**ViewSet:** `ListeningAllPartsQuestionByExamViewSet` (UPDATE)

**NEW Response Structure (Following Reading Mock):**
```json
{
  "exam_id": 1,
  "resource_ids": {
    "part1_question_id": 123,
    "part2_question_id": 456,
    "part3_question_id": 789,
    "part4_question_id": 101,
    "part5_question_id": 202,
    "part6_question_id": 303
  },
  "part1": {
    "global_start": 1,
    "global_end": 8,
    "title": "Listening Part 1",
    "instruction": "...",
    "question": "...",
    "audio_url": "...",
    "questions": [
      {
        "position": 1,
        "question": "Question 1",
        "answers": [
          {"letter": "A", "text": "Option A"},
          {"letter": "B", "text": "Option B"},
          {"letter": "C", "text": "Option C"},
          {"letter": "D", "text": "Option D"}
        ]
      }
    ]
  },
  "part2": {
    "global_start": 9,
    "global_end": 13,
    "title": "Listening Part 2",
    "instruction": "...",
    "question": "Text with _1_, _2_, _3_, _4_, _5_",
    "audio_url": "...",
    "positions": [1, 2, 3, 4, 5]
  },
  "part3": {
    "global_start": 14,
    "global_end": 18,
    "title": "Speaker Matching",
    "instruction": "...",
    "audio_url": "...",
    "speakers": [
      {"position": 1, "text": "Speaker 1"}
    ],
    "options": [
      {"letter": "A", "text": "Option A"}
    ]
  },
  "part4": {
    "global_start": 19,
    "global_end": 23,
    "title": "Map Task",
    "instruction": "...",
    "audio_url": "...",
    "map_image_url": "...",
    "places": [
      {"position": 1, "text": "Place 1"}
    ],
    "options_count": 8
  },
  "part5": {
    "global_start": 24,
    "global_end": 29,
    "title": "Listening Part 5",
    "instruction": "...",
    "audio_url": "...",
    "extracts": [
      {
        "extract_number": 1,
        "audio_url": "...",
        "questions": [
          {
            "position": 1,
            "question": "...",
            "answers": [
              {"letter": "A", "text": "Option A"}
            ]
          }
        ]
      }
    ]
  },
  "part6": {
    "global_start": 30,
    "global_end": 35,
    "title": "Listening Part 6",
    "instruction": "...",
    "question": "Text with _1_, _2_, _3_, _4_, _5_, _6_",
    "audio_url": "...",
    "positions": [1, 2, 3, 4, 5, 6]
  }
}
```

### POST Endpoint (SAME URL, NEW STRUCTURE)
**URL:** `/api/multilevel/{exam_id}/listening/all/evaluate/`
**ViewSet:** `ListeningAllPartsEvaluateViewSet` (UPDATE)

**NEW Request Structure (Simple Global Answers):**
```json
{
  "resource_ids": {
    "part1_question_id": 123,
    "part2_question_id": 456,
    "part3_question_id": 789,
    "part4_question_id": 101,
    "part5_question_id": 202,
    "part6_question_id": 303
  },
  "answers": {
    "1": "A",
    "2": "B",
    "9": "Paris",
    "10": "Monday",
    "14": "A",
    "19": "B",
    "24": "A",
    "30": "answer"
  }
}
```

**NEW Response Structure (Global Results + Part Details):**
```json
{
  "attempt_id": 999,
  "overall_score_percent": 85.71,
  "total_correct": 30,
  "total_questions": 35,
  "cefr_level": "C1",
  "results": {
    "1": {"is_correct": true, "user_answer": "A", "correct_answer": "A"},
    "2": {"is_correct": false, "user_answer": "B", "correct_answer": "C"},
    "35": {"is_correct": true, "user_answer": "answer", "correct_answer": "answer"}
  },
  "part_details": {
    "part1": {
      "question": {
        "id": 123,
        "title": "...",
        "instruction": "...",
        "audio_url": "..."
      },
      "summary": {
        "correct_count": 6,
        "total": 8,
        "score_percent": 75.0
      }
    },
    "part2": {
      "question": {
        "id": 456,
        "title": "...",
        "instruction": "...",
        "question": "...",
        "audio_url": "..."
      },
      "summary": {
        "correct_count": 4,
        "total": 5,
        "score_percent": 80.0
      }
    }
  }
}
```

---

## BACKEND IMPLEMENTATION TASKS

### Task 1: Update GET Endpoint Structure
**File:** `smartexam/backend/multilevel/apis/listening_questions.py`
**Function:** `ListeningAllPartsQuestionByExamViewSet.retrieve()`

**Changes:**
1. Add `resource_ids` to response (question IDs for each part)
2. Restructure Part 1 to use simple structure (call Part 1 simple internally)
3. Restructure Part 2 to use simple structure (call Part 2 simple internally)
4. Restructure Part 3 to use simple structure (call Part 3 simple internally)
5. Restructure Part 4 to use simple structure (call Part 4 simple internally)
6. Restructure Part 5 to use simple structure (call Part 5 simple internally)
7. Restructure Part 6 to use simple structure (call Part 6 simple internally)
8. Add `global_start` and `global_end` to each part

**Code Pattern:**
```python
def retrieve(self, request, exam_id=None):
    exam, err = _get_exam_or_error(exam_id)
    if err:
        return err

    # Get random questions from each part (using simple structure internally)
    part1_q = ListeningPart1Question.objects.filter(part__exam=exam).order_by("?").first()
    part2_q = ListeningPart2Question.objects.filter(part__exam=exam).order_by("?").first()
    # ... etc for all parts

    if not (part1_q and part2_q and part3_q and part4_q and part5_q and part6_q):
        return Response({"detail": "not enough parts"}, status=404)

    # Build Part 1 using simple structure
    part1_questions = ListeningPart1Answer.objects.filter(question=part1_q).order_by("position", "id")
    part1_by_position = {}
    for a in part1_questions:
        if a.position not in part1_by_position:
            part1_by_position[a.position] = []
        part1_by_position[a.position].append(a)
    
    part1_questions_list = []
    letters = ['A', 'B', 'C', 'D']
    for position in sorted(part1_by_position.keys())[:8]:
        answers_for_position = part1_by_position[position]
        answer_options = []
        for idx, ans in enumerate(answers_for_position[:4]):
            answer_options.append({
                "letter": letters[idx],
                "text": ans.answer
            })
        part1_questions_list.append({
            "position": position,
            "question": f"Question {position}",
            "answers": answer_options
        })

    # ... similar for other parts

    return Response({
        "exam_id": exam.id,
        "resource_ids": {
            "part1_question_id": part1_q.id,
            "part2_question_id": part2_q.id,
            "part3_question_id": part3_q.id,
            "part4_question_id": part4_q.id,
            "part5_question_id": part5_q.id,
            "part6_question_id": part6_q.id,
        },
        "part1": {
            "global_start": 1,
            "global_end": 8,
            "title": part1_q.title,
            "instruction": part1_q.instruction,
            "question": part1_q.question,
            "audio_url": _file_url(request, part1_q.audio),
            "questions": part1_questions_list,
        },
        # ... other parts
    })
```

### Task 2: Update POST Endpoint Structure
**File:** `smartexam/backend/multilevel/apis/listening.py`
**Function:** `ListeningAllPartsEvaluateViewSet.create()`

**Changes:**
1. Accept new request format: `{"resource_ids": {...}, "answers": {"1": "A", ...}}`
2. Split answers by global position ranges (1-8, 9-13, 14-18, 19-23, 24-29, 30-35)
3. Call individual part evaluate functions (simple structure)
4. Build global results dict (1-35)
5. Build part_details dict for accordion
6. Return new response format

**Code Pattern:**
```python
def create(self, request, exam_id=None, *args, **kwargs):
    exam, err = _get_exam_or_error(exam_id)
    if err:
        return err

    # Get resource IDs and answers
    resource_ids = request.data.get("resource_ids", {})
    answers = request.data.get("answers", {})
    
    if not resource_ids or not answers:
        return Response({"detail": "resource_ids and answers required"}, status=400)
    
    # Extract resource IDs
    part1_question_id = resource_ids.get("part1_question_id")
    part2_question_id = resource_ids.get("part2_question_id")
    # ... etc

    # Split answers by global position ranges
    part1_answers = {}  # 1-8
    part2_answers = {}  # 9-13
    part3_answers = {}  # 14-18
    part4_answers = {}  # 19-23
    part5_answers = {}  # 24-29
    part6_answers = {}  # 30-35
    
    for position_str, answer in answers.items():
        position = int(position_str)
        if 1 <= position <= 8:
            local_position = position
            part1_answers[str(local_position)] = answer
        elif 9 <= position <= 13:
            local_position = position - 8
            part2_answers[str(local_position)] = answer
        # ... etc

    # Evaluate each part using simple structure functions
    part_results = {}
    part_details = {}
    total_correct = 0
    
    # Part 1
    if part1_question_id and part1_answers:
        result = _evaluate_part1_simple(part1_question_id, part1_answers)
        if result:
            # Add to global results with offset 0
            for local_pos, item in result["results"].items():
                global_pos = int(local_pos)
                part_results[str(global_pos)] = {
                    "is_correct": item["is_correct"],
                    "user_answer": item["user_answer"],
                    "correct_answer": item["correct_answer"]
                }
            part_details["part1"] = {
                "question": result["question"],
                "summary": result["summary"]
            }
            total_correct += result["summary"]["correct_count"]
    
    # ... similar for other parts

    # Calculate overall score
    overall = _score_percent(total_correct, 35)
    cefr = _cefr_from_percent(overall)

    # Create user attempt
    attempt = UserAttempt.objects.create(
        user=request.user,
        exam=exam,
        section=Section.LISTENING,
        cefr_level=cefr,
        final_result=int(overall),
    )

    return Response({
        "attempt_id": attempt.id,
        "overall_score_percent": overall,
        "total_correct": total_correct,
        "total_questions": 35,
        "cefr_level": cefr,
        "results": part_results,  # Global 1-35
        "part_details": part_details,  # For accordion
    })
```

### Task 3: Update Serializer
**File:** `smartexam/backend/multilevel/serializers.py`
**Serializer:** `ListeningAllPartsEvaluateRequestSerializer`

**Changes:**
1. Update to accept new format
2. Add validation for resource_ids
3. Add validation for answers dict

**Code:**
```python
class ListeningAllPartsEvaluateRequestSerializer(serializers.Serializer):
    resource_ids = serializers.DictField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Resource IDs for each part"
    )
    answers = serializers.DictField(
        child=serializers.CharField(allow_blank=True),
        required=True,
        help_text="Global answers dict: {'1': 'A', '2': 'text', ...}"
    )
```

---

## TESTING PLAN

### Test 1: GET Endpoint
```python
# File: smartexam/backend/test_listening_mock_simple.py
import requests

token = "YOUR_TOKEN"
headers = {"Authorization": f"Bearer {token}"}

# GET request
response = requests.get(
    "http://localhost:8000/api/multilevel/1/listening/all/question/",
    headers=headers
)

print("Status:", response.status_code)
data = response.json()

# Verify structure
assert "resource_ids" in data
assert "part1" in data
assert "global_start" in data["part1"]
assert data["part1"]["global_start"] == 1
assert data["part1"]["global_end"] == 8
print("✅ GET endpoint structure correct")
```

### Test 2: POST Endpoint
```python
# Prepare answers
answers = {
    "1": "A", "2": "B", "3": "C", "4": "D", "5": "A", "6": "B", "7": "C", "8": "D",
    "9": "Paris", "10": "Monday", "11": "10 am", "12": "answer", "13": "answer",
    "14": "A", "15": "B", "16": "C", "17": "D", "18": "E",
    "19": "A", "20": "B", "21": "C", "22": "D", "23": "E",
    "24": "A", "25": "B", "26": "C", "27": "A", "28": "B", "29": "C",
    "30": "answer", "31": "answer", "32": "answer", "33": "answer", "34": "answer", "35": "answer"
}

payload = {
    "resource_ids": data["resource_ids"],
    "answers": answers
}

# POST request
response = requests.post(
    "http://localhost:8000/api/multilevel/1/listening/all/evaluate/",
    headers=headers,
    json=payload
)

print("Status:", response.status_code)
result = response.json()

# Verify structure
assert "results" in result
assert "part_details" in result
assert "1" in result["results"]
assert "35" in result["results"]
print("✅ POST endpoint structure correct")
```

---

## SUMMARY

**Backend Changes:**
1. ✅ GET endpoint returns simple structure with resource_ids (like Reading Mock)
2. ✅ POST endpoint accepts simple global answers (like Reading Mock)
3. ✅ POST endpoint returns global results + part_details (like Reading Mock)
4. ✅ All parts use simple structure internally (reuse existing simple functions)
5. ✅ Professional API structure matching Reading Mock exactly

**Benefits:**
- ✅ Consistent with Reading Mock pattern
- ✅ Simpler frontend integration
- ✅ Single answers object (not 6 separate states)
- ✅ Global numbering (1-35) throughout
- ✅ Resource IDs for evaluation
- ✅ Part details for accordion display
