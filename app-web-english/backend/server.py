from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# a la hora de crear en mongodb por defecto crear mi_base_de_datos
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
print(f"✅ Conectado a la base de datos: {os.environ['DB_NAME']} en {mongo_url}")


# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: Literal["student", "teacher"]
    password_hash: Optional[str] = Field(default=None, exclude=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Literal["student", "teacher"]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Exercise(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    exercise_type: Literal["word", "phrase", "listening"]
    content: str  # The word, phrase, or question
    correct_audio_url: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"]
    teacher_id: str
    vocabulary_list_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExerciseCreate(BaseModel):
    title: str
    description: str
    exercise_type: Literal["word", "phrase", "listening"]
    content: str
    correct_audio_url: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"]
    vocabulary_list_id: Optional[str] = None

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    exercise_id: str
    score: float  # 0-100
    pronunciation_accuracy: float  # 0-100
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    feedback: Optional[str] = None

class ProgressCreate(BaseModel):
    exercise_id: str
    score: float
    pronunciation_accuracy: float
    feedback: Optional[str] = None

class VocabularyList(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    teacher_id: str
    words: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VocabularyListCreate(BaseModel):
    name: str
    description: str
    words: List[str]

# ============ AUTH UTILITIES ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):

    # se añadira prints o logs que verifiquen que recibe fastApi
    print("===== /auth/register called =====")
    print("Datos recibidos:", user_data)

    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        password_hash=hashed_pw
    )
    
    # Convert to dict and manually include password_hash since it's excluded from model_dump
    doc = user.model_dump()
    doc['password_hash'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user.id, email=user.email, name=user.name, role=user.role)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user.id, email=user.email, name=user.name, role=user.role)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role
    )

# ============ EXERCISE ROUTES ============

@api_router.post("/exercises", response_model=Exercise)
async def create_exercise(exercise_data: ExerciseCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create exercises")
    
    exercise = Exercise(**exercise_data.model_dump(), teacher_id=current_user.id)
    doc = exercise.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.exercises.insert_one(doc)
    return exercise

@api_router.get("/exercises", response_model=List[Exercise])
async def get_exercises(current_user: User = Depends(get_current_user)):
    exercises = await db.exercises.find({}, {"_id": 0}).to_list(1000)
    for ex in exercises:
        if isinstance(ex.get('created_at'), str):
            ex['created_at'] = datetime.fromisoformat(ex['created_at'])
    return exercises

@api_router.get("/exercises/{exercise_id}", response_model=Exercise)
async def get_exercise(exercise_id: str, current_user: User = Depends(get_current_user)):
    exercise = await db.exercises.find_one({"id": exercise_id}, {"_id": 0})
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if isinstance(exercise.get('created_at'), str):
        exercise['created_at'] = datetime.fromisoformat(exercise['created_at'])
    return Exercise(**exercise)

@api_router.put("/exercises/{exercise_id}", response_model=Exercise)
async def update_exercise(exercise_id: str, exercise_data: ExerciseCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update exercises")
    
    existing = await db.exercises.find_one({"id": exercise_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    if existing.get('teacher_id') != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own exercises")
    
    update_data = exercise_data.model_dump()
    await db.exercises.update_one({"id": exercise_id}, {"$set": update_data})
    
    updated_doc = await db.exercises.find_one({"id": exercise_id}, {"_id": 0})
    if isinstance(updated_doc.get('created_at'), str):
        updated_doc['created_at'] = datetime.fromisoformat(updated_doc['created_at'])
    return Exercise(**updated_doc)

@api_router.delete("/exercises/{exercise_id}")
async def delete_exercise(exercise_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete exercises")
    
    result = await db.exercises.delete_one({"id": exercise_id, "teacher_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found or unauthorized")
    return {"message": "Exercise deleted"}

# ============ PROGRESS ROUTES ============

@api_router.post("/progress", response_model=Progress)
async def create_progress(progress_data: ProgressCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit progress")
    
    progress = Progress(**progress_data.model_dump(), student_id=current_user.id)
    doc = progress.model_dump()
    doc['completed_at'] = doc['completed_at'].isoformat()
    await db.progress.insert_one(doc)
    return progress

@api_router.get("/progress/student/{student_id}", response_model=List[Progress])
async def get_student_progress(student_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Students can only view their own progress")
    
    progress_list = await db.progress.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    for p in progress_list:
        if isinstance(p.get('completed_at'), str):
            p['completed_at'] = datetime.fromisoformat(p['completed_at'])
    return progress_list

@api_router.get("/progress/exercise/{exercise_id}", response_model=List[Progress])
async def get_exercise_progress(exercise_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view exercise progress")
    
    progress_list = await db.progress.find({"exercise_id": exercise_id}, {"_id": 0}).to_list(1000)
    for p in progress_list:
        if isinstance(p.get('completed_at'), str):
            p['completed_at'] = datetime.fromisoformat(p['completed_at'])
    return progress_list

# ============ DASHBOARD ROUTES ============

@api_router.get("/dashboard/student")
async def get_student_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access student dashboard")
    
    # Get all progress
    progress_list = await db.progress.find({"student_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    # Calculate stats
    total_exercises = len(progress_list)
    avg_score = sum(p['score'] for p in progress_list) / total_exercises if total_exercises > 0 else 0
    avg_pronunciation = sum(p['pronunciation_accuracy'] for p in progress_list) / total_exercises if total_exercises > 0 else 0
    
    # Get recent progress (last 10)
    recent = sorted(progress_list, key=lambda x: x['completed_at'], reverse=True)[:10]
    
    return {
        "total_exercises_completed": total_exercises,
        "average_score": round(avg_score, 2),
        "average_pronunciation": round(avg_pronunciation, 2),
        "recent_progress": recent
    }

@api_router.get("/dashboard/teacher")
async def get_teacher_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access teacher dashboard")
    
    # Get all students
    students = await db.users.find({"role": "student"}, {"_id": 0}).to_list(1000)
    
    # Get all exercises by this teacher
    exercises = await db.exercises.find({"teacher_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    # Get all progress
    all_progress = await db.progress.find({}, {"_id": 0}).to_list(1000)
    
    # Build student performance
    student_performance = []
    for student in students:
        student_progress = [p for p in all_progress if p['student_id'] == student['id']]
        if student_progress:
            avg_score = sum(p['score'] for p in student_progress) / len(student_progress)
            avg_pronunciation = sum(p['pronunciation_accuracy'] for p in student_progress) / len(student_progress)
        else:
            avg_score = 0
            avg_pronunciation = 0
        
        student_performance.append({
            "student_id": student['id'],
            "student_name": student['name'],
            "student_email": student['email'],
            "total_exercises": len(student_progress),
            "average_score": round(avg_score, 2),
            "average_pronunciation": round(avg_pronunciation, 2)
        })
    
    return {
        "total_students": len(students),
        "total_exercises_created": len(exercises),
        "student_performance": student_performance
    }

# ============ VOCABULARY LIST ROUTES ============

@api_router.post("/vocabulary-lists", response_model=VocabularyList)
async def create_vocabulary_list(vocab_data: VocabularyListCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create vocabulary lists")
    
    vocab_list = VocabularyList(**vocab_data.model_dump(), teacher_id=current_user.id)
    doc = vocab_list.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.vocabulary_lists.insert_one(doc)
    return vocab_list

@api_router.get("/vocabulary-lists", response_model=List[VocabularyList])
async def get_vocabulary_lists(current_user: User = Depends(get_current_user)):
    vocab_lists = await db.vocabulary_lists.find({}, {"_id": 0}).to_list(1000)
    for vl in vocab_lists:
        if isinstance(vl.get('created_at'), str):
            vl['created_at'] = datetime.fromisoformat(vl['created_at'])
    return vocab_lists

# ============ INCLUDE ROUTER ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()